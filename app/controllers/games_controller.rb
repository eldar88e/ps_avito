class GamesController < ApplicationController
  before_action :authenticate_user!

  def index
    @pagy, @games = pagy(@q.result, items: 12)
  end

  def show
    @game = Game.find_by(top: params[:id])
  end
end
