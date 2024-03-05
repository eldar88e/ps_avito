class PopulateExcelJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default

  def perform(**args)
    store = args[:store]
    games = Game.order(:top).with_attached_images
    name  = "top_1000_#{store.var}.xlsx"
    file  = Axlsx::Package.new

    file.workbook.add_worksheet(:name => "TOP_1000") do |sheet|
      sheet.add_row %w[Id	AdStatus	Category	GoodsType	AdType	Address	Title	Description Condition	Price
                       AllowEmail	ManagerName	ContactPhone	ImageNames	ImageUrls]

      games.each do |game|
        sheet.add_row [game.sony_id, store.ad_status, store.category, store.goods_type, store.ad_type, store.address,
                       make_title(game), description(game, store), store.condition, make_price(game.price_tl),
                       store.allow_email, store.manager_name, store.contact_phone] + make_image(game, store.var)
      end
    end
    file.use_shared_strings = true
    file.serialize(name)
    FtpService.new(name).send_file
  rescue => e
    TelegramService.new("Error #{self.class} || #{e.message}").report
    raise
  end

  private

  def make_title(game)
    raw_name = game.name
    platform = game.platform

    if platform == 'PS5, PS4' || platform.match?(/PS4/) #ps4, ps5
      prefix = ' (PS5 and PS4)'
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
        raw_name + ' (PS5)'
      end
    end
  end

  def make_image(game, site)
    if game.images.attached? && game.images.blobs.any? { |i| i.metadata[:site] == site }
      image = game.images.find { |i| i.blob.metadata[:site] == site }
      [image.blob.filename.to_s, rails_blob_url(image, host: 'server.open-ps.ru')]
    else
      [nil, nil]
    end
  end

  def description(game, store)
    #method_name = "desc_#{site}".to_sym
    #DescriptionService.new(game).send(method_name)
    rus_voice = game.rus_voice ? 'Есть' : 'Нет'
    rus_text  = game.rus_screen ? 'Есть' : 'Нет'
    store.description.gsub('[name]', game.name).gsub('[rus_voice]', rus_voice).gsub('[manager]', store.manager_name)
        .gsub('[rus_text]', rus_text).gsub('[platform]', game.platform).squeeze(' ').chomp
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
