class AddressesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_address, only: [:update, :destroy]

  def create
    address = Store.find(params[:store_id]).addresses.build(address_params)
    if address.save
      msg = ["Адрес #{address.store_address} был успешно добавлен."]
      msg << 'Внимание адрес не активен!' if address_params[:active].to_i.zero?
      render turbo_stream: [
        turbo_stream.append(:addresses, partial: 'addresses/address', locals: { address: address }),
        success_notice(msg)
      ]
    else
      error_notice(address.errors.full_messages)
    end
  end

  def update
    if @address.update(address_params)
      msg = ["Адрес #{@address.store_address} был успешно обновлен."]
      msg << 'Внимание адрес не активен!' if address_params[:active].to_i.zero?
      render turbo_stream: [
        turbo_stream.replace("address_#{@address.id}", partial: 'addresses/address', locals: { address: @address }),
        success_notice(msg)
      ]
    else
      error_notice(@address.errors.full_messages)
    end
  end

  def destroy
    if @address.destroy
      msg = "Адрес #{@address.store_address} был успешно удален."
      render turbo_stream: [ turbo_stream.remove("address_#{@address.id}"), success_notice(msg)]
    else
      error_notice(@address.errors.full_messages)
    end
  end

  private

  def set_address
    @address = Address.find(params[:id])
  end

  def address_params
    params.require(:address).permit(:store_address, :slogan, :slogan_params, :active, :image, :description)
  end
end
