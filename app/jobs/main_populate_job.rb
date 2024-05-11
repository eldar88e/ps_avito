class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform
    new_games = TopGamesJob.perform_now
    GameImageDownloaderJob.perform_now if new_games > 0
    WatermarksSheetsJob.perform_now
  end
end
