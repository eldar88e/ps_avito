class AdsController < ApplicationController
  before_action :authenticate_user!

  def update_all
    store = current_user.stores.find(params[:store_id])
    store.ads.update_all(banned: false)
    render turbo_stream: success_notice('Все объявления были сняты с бана!')
  end
end
