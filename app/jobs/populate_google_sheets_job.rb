class PopulateGoogleSheetsJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default

  def perform(**args)
    file_id     = nil # current_user.settings.pluck(:var, :value).to_h["tid_#{args[:site]}"]
    games       = Game.order(:top).with_attached_images

    session     = GoogleDrive::Session.from_service_account_key('key.json')
    spreadsheet = session.file_by_id(file_id)
    worksheet   = spreadsheet.worksheets.first

    idx = 2
    games.each_slice(100) do |games_slice|
      games_slice.each do |game|
        worksheet[idx, 7]  = game.sony_id
        worksheet[idx, 12] = make_name(game)
        worksheet[idx, 13] = description(game, args[:site])
        worksheet[idx, 14] = make_price(game.price_tl)
        worksheet[idx, 15] = make_image(game, args[:site])
        idx += 1
      end
      worksheet.save
    end
    nil
  rescue => e
    TelegramService.new("Error #{self.class} || #{e.message}").report
    raise
  end

  private

  def make_name(game)
    raw_name = game.name
    platform  = game.platform

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
      rails_blob_url(image, host: 'server.open-ps.ru')
    else
      nil
    end
  end

  def description(game, site)
    method_name = "desc_#{site}".to_sym
    DescriptionService.new(game).send(method_name)
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
