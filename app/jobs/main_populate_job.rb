class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform
    TopGamesJob.perform_now
    GameImageDownloaderJob.perform_now
    WatermarksSheetsJob.perform_now
  end
end
