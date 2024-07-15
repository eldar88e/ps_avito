class GamesController < ApplicationController
  before_action :authenticate_user!

  def index
    @pagy, @games = pagy(@q.result, items: 12)
    active_stores = current_user.stores.where(active: true)
    @a_s          = active_stores.ids
    @a_a          = Address.joins(:store).where(store: { id: active_stores.ids }, active: true).ids
  end

  def show
    @game = Game.find_by(top: params[:id])
  end
end