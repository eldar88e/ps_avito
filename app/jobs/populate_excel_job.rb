class PopulateExcelJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default
  COLUMNS_NAME = %w[Id AvitoId DateBegin AdStatus Category GoodsType AdType Type Platform Localization Address Title
                    Description Condition Price AllowEmail ManagerName	ContactPhone ContactMethod ImageUrls].freeze

  def perform(**args)
    store     = args[:store]
    user      = args[:store].user
    settings  = user.settings.pluck(:var, :value).to_h
    workbook  = FastExcel.open
    worksheet = workbook.add_worksheet
    worksheet.append_row(COLUMNS_NAME)
    products = user.products.active.with_attached_image
    store.addresses.where(active: true).find_each do |address|
      game_ads = address.ads.active_ads.for_game
      games    = active_game(address, settings)
      games.each { |game| process_game(game, address, game_ads, worksheet) }
      product_ads = address.ads.active_ads.for_product
      products.each { |product| process_product(product, address, product_ads, worksheet) }
    end

    content   = workbook.read_string
    xlsx_path = "./game_lists/top_1000_#{store.var}.xlsx"
    File.binwrite(xlsx_path, content) # FtpService.call(xlsx_path) if settings['send_ftp']
    domain = Rails.env.production? ? 'server.open-ps.ru' : 'localhost:3000'
    msg    = "✅ File http://#{domain}#{xlsx_path[1..]} is updated!"
    broadcast_notify(msg)
    TelegramService.call(user, msg)
  rescue StandardError => e
    Rails.logger.error("Error #{self.class} || #{e.message}")
    TelegramService.call(user, "Error #{self.class} || #{e.message}")
  end

  private

  def active_game(address, settings)
    Game.order(:top).active.limit(address.total_games || settings['quantity_games']).includes(:game_black_list)
  end

  def process_game(game, address, ads, worksheet)
    return if game.game_black_list

    store        = address.store
    current_time = Time.current.strftime('%d.%m.%y')
    file_id      = "#{game.sony_id}_#{store.id}_#{address.id}"
    ad           = ads.find { |i| i[:file_id] == file_id }
    img_url      = make_image(ad)
    return if img_url.blank?

    price = GamePriceService.call(game.price_tl, store)
    worksheet.append_row(
      [ad.id, ad.avito_id, current_time, store.ad_status, store.category, store.goods_type, store.ad_type,
       store.type, make_platform(game), make_local(game), ad.full_address || address.store_address,
       make_title(game), make_description(game, store, address), store.condition, price, store.allow_email,
       store.manager_name, store.contact_phone, store.contact_method, img_url]
    )
  end

  def process_product(product, address, ads, worksheet)
    store = address.store
    ad    = ads.find { |i| i[:file_id] == "#{product.id}_#{store.id}_#{address.id}" }
    return if ad.nil?

    current_time = Time.current.strftime('%d.%m.%y')
    worksheet.append_row(
      [ad.id, ad.avito_id, current_time, product.ad_status || store.ad_status, product.category || store.category,
       product.goods_type || store.goods_type, product.ad_type || store.ad_type, product.type || store.type,
       product.platform, product.localization, ad.full_address || address.store_address, product.title,
       make_description(product, store, address), product.condition || store.condition, product.price,
       product.allow_email || store.allow_email, store.manager_name, store.contact_phone,
       product.contact_method || store.contact_method, make_image(ad)]
    )
  end

  def make_platform(game)
    platform = game.platform
    return 'PlayStation 5' if platform.include?('PS5')

    'PlayStation 4'
  end

  def make_local(game)
    if game.rus_voice
      'Русская озвучка, субтитры и интерфейс'
    elsif game.rus_screen
      'Русский интерфейс'
    else
      'Без локализации'
    end
  end

  def make_title(game)
    raw_name = game.name
    platform = game.platform
    prefix   = ' PS5 и PS4'

    if platform == 'PS5, PS4'
      if raw_name.downcase.include?('ps4')
        if raw_name.downcase.include?('ps5')
          raw_name
        else
          raw_name.sub('(PS4)', '').sub('PS4', '').strip[0..39] + prefix
        end
      elsif raw_name.downcase.include?('ps5')
        raw_name.sub('(PS5)', '').sub('PS5', '')[0..39] + prefix
      else
        raw_name.strip[0..39] + prefix
      end
    elsif platform.include?('PS5') # ps5
      if raw_name.downcase.include?('ps5')
        raw_name
      else
        "#{raw_name.strip[0..45]} PS5"
      end
    else # ps4
      prefix_old = ' ps4 и ps5'
      if raw_name.downcase.include?('ps4')
        raw_name.sub('(PS4)', '').sub('PS4', '').strip[0..39] + prefix_old
      else
        raw_name.strip[0..39] + prefix_old
      end
    end
  end

  def make_image(ad)
    image = ad&.image
    return if image.nil? || image.blob.nil?

    params = Rails.env.production? ? { host: 'server.open-ps.ru' } : { host: 'localhost', port: 3000 }
    return rails_blob_url(image, params) if image.blob.service_name != 'amazon'

    bucket = Rails.application.credentials.dig(:aws, :bucket)
    key    = image.blob.key
    "https://#{bucket}.s3.amazonaws.com/#{key}"
  end

  def make_description(model, store, address)
    DescriptionService.call(model:, store:, address_desc: address.description)
  end
end
