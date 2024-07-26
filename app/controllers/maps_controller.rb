class MapsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_address, only: [:show]

  def show
    if @address
      render turbo_stream: [
        turbo_stream.replace("address_#{@address.id}", partial: '/maps/map', locals: { address: @address }),
      ]
    else
      error_notice(@address&.errors&.full_messages || 'Error getting address')
    end
  end


  private

  def set_address
    store    = current_user.stores.find(params[:store_id])
    @address = store.addresses.find(params[:address_id]) if store
  end
end
