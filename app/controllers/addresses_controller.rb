class AddressesController < ApplicationController
  before_action :authenticate_user!

  def create
    store_id = request.referer.split('/')[-1]
    @store   = Store.find(store_id).addresses.build(address_params)

    if @store.save
      redirect_to store_path(@store), notice: 'Address was successfully created!'
    else
      render 'stores/show'
    end
  end

  def update
    @address = Address.find(params[:id])
    @store   = @address.store

    if @address.update(address_params)
      redirect_to store_path(@store), alert: 'Address edited!'
    else
      redirect_to store_path(@store), alert: 'Error editing address!'
    end
  end

  private

  def address_params
    params.require(:address).permit(:store_address, :slogan, :slogan_params, :active, :image, :description)
  end
end
