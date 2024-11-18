class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user      = current_user(args[:user_id])
    settings  = user.settings.pluck(:var, :value).to_h
    new_games = TopGamesJob.perform_now(settings:, user:)
    GameImageDownloaderJob.perform_now(settings:, user:) if new_games.positive?
    WatermarksSheetsJob.perform_later(user:)
    Avito::UpdatePriceJob.perform_later(user:) if Rails.env.production?
  end
end
