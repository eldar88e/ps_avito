class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform(**args)
    current_user = current_user(args[:user_id])
    settings     = current_user.settings.pluck(:var, :value).to_h
    new_games    = TopGamesJob.perform_now(settings: settings, user: current_user)
    GameImageDownloaderJob.perform_now(settings: settings, user: current_user) if new_games > 0
    WatermarksSheetsJob.perform_later(user: current_user)
    Avito::UpdatePriceJob.perform_later
  end
end
