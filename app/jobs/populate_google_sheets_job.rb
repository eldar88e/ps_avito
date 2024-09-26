class PopulateGoogleSheetsJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default

  def perform(**args)
    current_user = find_user args[:user_id]
    file_id      = current_user.settings.pluck(:var, :value).to_h["tid_#{args[:site]}"]
    games        = Game.order(:top).active.with_attached_images
    session      = GoogleDrive::Session.from_service_account_key('key.json')
    spreadsheet  = session.file_by_id(file_id)
    worksheet    = spreadsheet.worksheets.first

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
    TelegramService.call(current_user, "Error #{self.class} || #{e.message}")
  end
end
