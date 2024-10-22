class MapsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_store, only: [:show]
  before_action :set_address, only: [:show]

  def show
    return error_notice('Error getting address') if @address.nil?

    render turbo_stream: [
      turbo_stream.replace("address_#{@address.id}", partial: '/maps/map', locals: { address: @address })
    ]
  end


  private

  def set_address
    @address = @store.addresses.find(params[:address_id]) if @store
  end
end
