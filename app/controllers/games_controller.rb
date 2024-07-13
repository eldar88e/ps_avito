class GamesController < ApplicationController
  before_action :authenticate_user!

  def index
    # @games = Game.order(:top).page(params[:page]).per(12)
    @pagy, @games = pagy(@q.result, items: 12)
    @a_a = Address.where(active: true).pluck(:id)
    @a_s = Store.where(active: true).pluck(:id)
  end

  def show
    @game = Game.find_by(top: params[:id])
  end
end