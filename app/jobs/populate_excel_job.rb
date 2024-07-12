class PopulateExcelJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default

  def perform(**args)
    store     = args[:store]
    name      = "top_1000_#{store.var}.xlsx"
    xlsx_path = "./game_lists/#{name}"
    # file      = Axlsx::Package.new
    workbook  = FastExcel.open
    worksheet = workbook.add_worksheet
    products  = Product.where(active: true).with_attached_image

    # worksheet.append_row(name: store.var) do |sheet|
      worksheet.append_row %w[Id	AdStatus Category GoodsType	AdType Type Platform Localization Address Title
                       Description Condition Price AllowEmail	ManagerName	ContactPhone ContactMethod ImageUrls]

      store.addresses.where(active: true).each do |address|
        games = Game.order(:top).limit(address.total_games || 1000).with_attached_images # TODO limit games import to settings
        games.each do |game|
          # sheet.worksheet.add_row
          worksheet.append_row ["#{game.sony_id}_#{store.id}_#{address.id}", store.ad_status, store.category,
                         store.goods_type, store.ad_type, store.type, make_platform(game),  make_local(game),
                         address.store_address, make_title(game), make_description(game, store, address),
                         store.condition, make_price(game.price_tl), store.allow_email, store.manager_name,
                         store.contact_phone, store.contact_method, make_image(game, store, address)]
        end
      end

      store.addresses.where(active: true).each do |address|
        products.each do |product|
          worksheet.append_row ["#{product.id}_#{store.id}_#{address.id}", product.ad_status || store.ad_status,
                         product.category || store.category, product.goods_type || store.goods_type,
                         product.ad_type || store.ad_type, product.type || store.type, product.platform, product.localization,
                         address.store_address, product.title, make_description(product, store, address),
                         product.condition || store.condition, product.price, product.allow_email || store.allow_email,
                         store.manager_name, store.contact_phone, product.contact_method || store.contact_method,
                         make_image(product, store, address)]
        end
      end
    #end
    #file.use_shared_strings = true
    #file.serialize(xlsx_path)
    content = workbook.read_string
    File.open(xlsx_path, 'wb') { |f| f.write(content) }

    domain = Rails.env.production? ? 'server.open-ps.ru' : 'localhost:3000'
    TelegramService.new("✅ File http://#{domain}/game_lists/#{name} is updated!").report

    #FtpService.new(name).send_file
  rescue => e
    Rails.logger.error("Error #{self.class} || #{e.message}")
    TelegramService.call("Error #{self.class} || #{e.message}")
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

    if platform == 'PS5, PS4' || platform.match?(/PS4/) #ps4, ps5
      prefix = ' PS5 и PS4'
      if raw_name.downcase.match?(/ps4/)
        if raw_name.downcase.match?(/ps5/)
          raw_name
        else
          raw_name.sub('(PS4)', '').sub('PS4', '') + prefix
        end
      else
        if raw_name.downcase.match?(/ps5/)
          raw_name.sub('(PS5)', '').sub('PS5', '') + prefix
        else
          raw_name + prefix
        end
      end
    else #ps5
      if raw_name.downcase.match?(/ps5/)
        raw_name
      else
        raw_name + ' PS5'
      end
    end
  end

  def make_image(model, store, address)
    if model.images.attached? && model.images.blobs.any? { |i| i.metadata[:store_id] == store.id && i.metadata[:address_id] == address.id }
      image = model.images.find { |i| i.blob.metadata[:store_id] == store.id && i.blob.metadata[:address_id] == address.id }
      params = Rails.env == 'production' ? { host: 'server.open-ps.ru' } : { host: 'localhost', port: 3000 }
      rails_blob_url(image, params)
    end
  end

  def make_image_product(product)
    return unless product.image.attached?

    params = Rails.env == 'production' ? { host: 'server.open-ps.ru' } : { host: 'localhost', port: 3000 }
    rails_blob_url(product.image, params)
  end

  def make_description(model, store, address)
    if model.is_a?(Game)
      desc_game = store.desc_game.to_s + store.description
      rus_voice = model.rus_voice ? 'Есть' : 'Нет'
      rus_text  = model.rus_screen ? 'Есть' : 'Нет'
      desc_game.gsub('[name]', model.name).gsub('[rus_voice]', rus_voice).gsub('[manager]', store.manager_name)
           .gsub('[rus_text]', rus_text).gsub('[platform]', model.platform).gsub('[addr_desc]', address.description || '')
           .squeeze(' ').chomp
    else
      desc_product = store.description + store.desc_product.to_s
      desc_product.gsub('[name]', model.title).gsub('[addr_desc]', address.description || '')
                  .gsub('[manager]', store.manager_name).gsub('[desc_product]', model.description).squeeze(' ').chomp
    end
  end

  def make_price(price)
    exchange_rate = make_exchange_rate(price)
    round_up_price(price * exchange_rate)
  end

  def round_up_price(price)
    #(price / settings['round_price'].to_f).round * settings['round_price']
    (price / 10.to_f).round * 10
  end

  def make_exchange_rate(price)
    #от 1 до 300 лир курс - 5.5
    # от 300 до 800 лир курс 5
    # от 800 до 1200 курс 4.5
    # от 1200 до 1700 курс 4.3
    # от 1700 курс 4
    if price >= 1 && price < 300
      5.5
    elsif price >= 300 && price < 800
      5
    elsif price >= 800 && price < 1200
      # settings['exchange_rate'] - 0.5
      4.5
    elsif price >= 1200 && price < 1700
      4.3
    elsif price >= 1700
      4
    end
  end
end
