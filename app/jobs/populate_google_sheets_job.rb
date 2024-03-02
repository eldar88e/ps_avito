class PopulateGoogleSheetsJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default

  def perform(**args)
    file_id     = Setting.pluck(:var, :value).to_h["tid_#{args[:site]}"]
    games       = Game.order(:top)

    session     = GoogleDrive::Session.from_service_account_key('key.json')
    spreadsheet = session.file_by_id(file_id)
    worksheet   = spreadsheet.worksheets.first

    idx = 2
    games.each_slice(100) do |games_slice|
      games_slice.each do |game|
        worksheet[idx, 7]  = game.sony_id
        worksheet[idx, 12] = make_name(game)
        worksheet[idx, 13] = description(game, args[:site])
        worksheet[idx, 14] = game.price
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
      prefix = '(PS5 and PS4)'
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
        raw_name + '(PS5)'
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
end
