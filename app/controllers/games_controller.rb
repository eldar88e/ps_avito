class GamesController < ApplicationController

  def index
    @sony_games = Game.all.order(:top).limit(36)
  end
end