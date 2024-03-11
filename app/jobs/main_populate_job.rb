class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform
    new_games = TopGamesJob.perform_now
    GameImageDownloaderJob.perform_now if new_games > 0
    TelegramService.new("✅ Downloaded #{new_games} new game images.").report
    WatermarksSheetsJob.perform_now
  end
end
