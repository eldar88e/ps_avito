class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform(**args)
    TopGamesJob.perform_now

    GameImageDownloaderJob.perform_now

    WatermarksSheetsJob.perform_now

    TelegramService.new('👌Google sheets updated!').report
  end
end