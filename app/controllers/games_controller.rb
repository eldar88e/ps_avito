class GamesController < ApplicationController
  before_action :authenticate_user!
  add_breadcrumb "Главная", :root_path

  def index
    add_breadcrumb "Игры"
    @pagy, @games = pagy(@q.result, items: 12)
  end

  def show
    @game = Game.find_by(id: params[:id])
    add_breadcrumb "Игры", games_path
    add_breadcrumb @game.name
  end
end
