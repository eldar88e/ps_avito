class MapsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_address, only: [:show]

  def show
    if @address
      render turbo_stream: [
        turbo_stream.replace("address_#{@address.id}", partial: '/maps/map', locals: { address: @address }),
      ]
    else
      error_notice(@address.errors.full_messages)
    end
  end


  private

  def set_address
    @address = Address.find(params[:address_id])
  end
end
