class GamesController < ApplicationController

  def index
    @games = Game.all.order(:top).limit(36)
  end

  def show
    @game = Game.find_by(top: params[:id])
  end
end