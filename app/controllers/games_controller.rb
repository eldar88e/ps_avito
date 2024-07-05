class GamesController < ApplicationController
  before_action :authenticate_user!

  def index
    # @games = Game.order(:top).page(params[:page]).per(12)
    @pagy, @games = pagy(Game.order(:top), items: 12)
  end

  def show
    @game = Game.find_by(top: params[:id])
  end
end