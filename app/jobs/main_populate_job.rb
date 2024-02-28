class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform(*args)
    TopGamesJob.perform_now
    WatermarkJob.perform_now
    PopulateGoogleSheetsJob.perform_now

    TelegramService.new('👌Google sheets updated!').report
  end
end