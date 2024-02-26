class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform(*args)
    TopGamesJob.perform_later
    WatermarkJob.perform_later(size: 1080)
    PopulateGoogleSheetsJob.perform_later

    TelegramNotifier.report('👌Google sheets updated!')
  end
end