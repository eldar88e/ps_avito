class GamesController < ApplicationController

  def index
    @games = Game.order(:top).page(params[:page]).per(36)
  end

  def show
    @game = Game.find_by(top: params[:id])
  end
end