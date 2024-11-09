class GamesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_game, only: [:show, :destroy]
  add_breadcrumb "Главная", :root_path

  def index
    add_breadcrumb "Игры"
    @pagy, @games = pagy(@q.result, items: 12)
  end

  def show
    add_breadcrumb "Игры", games_path
    add_breadcrumb @game.name
  end

  def destroy
    if @game.destroy
      flash[:notice] = "Игра #{@game.name} был успешна удалена."
      redirect_to games_path
    end
  end

  private

  def set_game
    @game = Game.find(params[:id])
  end
end
