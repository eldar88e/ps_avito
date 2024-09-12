class PopulateExcelJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default

  def perform(**args)
    store     = args[:store]
    user      = args[:store].user
    settings  = user.settings.pluck(:var, :value).to_h
    xlsx_path = "./game_lists/top_1000_#{store.var}.xlsx"
    workbook  = FastExcel.open
    worksheet = workbook.add_worksheet
    products  = user.products.where(active: true).with_attached_image

    worksheet.append_row %w[Id AdStatus Category GoodsType AdType Type Platform Localization Address Title
                            Description Condition Price AllowEmail ManagerName	ContactPhone ContactMethod ImageUrls]

    ban_list = store.ban_lists.active.pluck(:ad_id)
    store.addresses.where(active: true).each do |address|
      games = Game.order(:top).limit(address.total_games || settings['quantity_games']).includes(:game_black_list)
      games.each do |game|
        next if game.game_black_list

        ad_id = "#{game.sony_id}_#{store.id}_#{address.id}"
        ad    = store.ads.find_by(file_id: ad_id, deleted: 0)
        next if ban_list.include? ad.id

        worksheet.append_row(
          [ad.id, store.ad_status, store.category, store.goods_type, store.ad_type, store.type, make_platform(game),
           make_local(game), address.store_address, make_title(game), make_description(game, store, address),
           store.condition, make_price(game.price_tl, store), store.allow_email, store.manager_name,
           store.contact_phone, store.contact_method, make_image(ad)]
        )
      end

      products.each do |product|
        ad_id = "#{product.id}_#{store.id}_#{address.id}"
        ad    = store.ads.find_by(file_id: ad_id, deleted: 0)
        next if ban_list.include? ad.id

        worksheet.append_row(
          [ad.id, product.ad_status || store.ad_status, product.category || store.category,
           product.goods_type || store.goods_type, product.ad_type || store.ad_type, product.type || store.type,
           product.platform, product.localization, address.store_address, product.title,
           make_description(product, store, address), product.condition || store.condition, product.price,
           product.allow_email || store.allow_email, store.manager_name, store.contact_phone,
           product.contact_method || store.contact_method, make_image(ad)]
        )
      end
    end

    content = workbook.read_string
    File.open(xlsx_path, 'wb') { |f| f.write(content) }

    # FtpService.call(xlsx_path) if settings['send_ftp']

    domain = Rails.env.production? ? 'server.open-ps.ru' : 'localhost:3000'
    msg    = "✅ File http://#{domain}#{xlsx_path[1..-1]} is updated!"
    broadcast_notify(msg)
    TelegramService.call(user, msg)
  rescue => e
    Rails.logger.error("Error #{self.class} || #{e.message}")
    TelegramService.call(user,"Error #{self.class} || #{e.message}")
  end

  private

  def make_platform(game)
    platform = game.platform
    return 'PlayStation 5' if platform.match?(/PS5/)

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

    if platform == 'PS5, PS4' # || platform.match?(/PS4/) #ps4, ps5
      if raw_name.downcase.match?(/ps4/)
        if raw_name.downcase.match?(/ps5/)
          raw_name
        else
          raw_name.sub('(PS4)', '').sub('PS4', '').strip[0..39] + prefix
        end
      else
        if raw_name.downcase.match?(/ps5/)
          raw_name.sub('(PS5)', '').sub('PS5', '')[0..39] + prefix
        else
          raw_name.strip[0..39] + prefix
        end
      end
    elsif platform.match?(/PS5/) #ps5
      if raw_name.downcase.match?(/ps5/)
        raw_name
      else
        raw_name.strip[0..45] + ' PS5'
      end
    else #ps4
      prefix_old = ' ps4 и ps5'
      if raw_name.downcase.match?(/ps4/)
        raw_name.sub('(PS4)', '').sub('PS4', '').strip[0..39] + prefix_old
      else
        raw_name.strip[0..39] + prefix_old
      end
    end
  end

  def make_image(ad)
    image = ad&.image
    return unless image

    params = Rails.env.production? ? { host: 'server.open-ps.ru' } : { host: 'localhost', port: 3000 }
    return rails_blob_url(image, params) if image.blob.service_name != "amazon"

    bucket = Rails.application.credentials.dig(:aws, :bucket)
    key    = image.blob.key
    "https://#{bucket}.s3.amazonaws.com/#{key}"
  end

  def make_description(model, store, address)
    if model.is_a?(Game)
      desc_game = store.desc_game.to_s + store.description
      rus_voice = model.rus_voice ? 'Есть' : 'Нет'
      rus_text  = model.rus_screen ? 'Есть' : 'Нет'
      desc_game.gsub('[name]', model.name).gsub('[rus_voice]', rus_voice).gsub('[manager]', store.manager_name)
               .gsub('[rus_text]', rus_text).gsub('[platform]', model.platform)
               .gsub('[addr_desc]', address.description.to_s).squeeze(' ').strip
    else
      desc_product = store.description + store.desc_product.to_s
      desc_product.gsub('[name]', model.title).gsub('[addr_desc]', address.description || '')
                  .gsub('[manager]', store.manager_name).gsub('[desc_product]', model.description).squeeze(' ').strip
    end
  end

  def make_price(price, store)
    percent       = store.percent || 0
    exchange_rate = make_exchange_rate(price)
    price_rub     = price * exchange_rate
    round_up_price(price_rub + (price_rub * percent / 100.0))
  end

  def round_up_price(price)
    (price / 10.to_f).round * 10
  end

  def make_exchange_rate(price)
    if price < 300
      ENV.fetch("LOWEST_PRICE") { 5.5 }.to_f
    elsif price >= 300 && price < 800
      ENV.fetch("LOW_PRICE") { 5 }.to_f
    elsif price >= 800 && price < 1200
      ENV.fetch("MEDIAN_PRICE") { 4.5 }.to_f
    elsif price >= 1200 && price < 1700
      ENV.fetch("HIGH_PRICE") { 4.3 }.to_f
    else
      ENV.fetch("HIGHEST_PRICE") { 4 }.to_f
    end
  end
end
