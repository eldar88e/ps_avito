class MainPopulateJob < ApplicationJob
  queue_as :default

  def perform(**args)
    ######
    args[:user_id] = 1 # TODO set in all job user_id
    current_user   = current_user(args[:user_id])
    settings       = current_user.settings.pluck(:var, :value).to_h
    #####

    new_games = TopGamesJob.perform_now(settings: settings, user: current_user)
    GameImageDownloaderJob.perform_now(settings: settings, user: current_user) if new_games > 0
    WatermarksSheetsJob.perform_now(user: current_user)
  end
end
