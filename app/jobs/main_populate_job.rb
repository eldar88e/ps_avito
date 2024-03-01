class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform(**args)
    TopGamesJob.perform_now
    TelegramService.new('✅ Game list updated!').report
    GameImageDownloaderJob.perform_now
    TelegramService.new('✅ All game image downloaded!').report
    WatermarksSheetsJob.perform_now

    TelegramService.new('👌Google sheets updated!').report
  end
end