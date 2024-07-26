class StreetsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_address, only: [:index, :create, :update, :destroy]
  before_action :set_street, only: [:update, :destroy]

  def index
    render turbo_stream: [
      turbo_stream.replace("address_#{@address.id}", partial: '/streets/streets_list', locals: { address: @address }),
    ]
  end

  def create
    street = @address.streets.build(title: params[:street][:title])
    if street.save
      msg = "Улица #{street.title} была успешно добавлена."
      render turbo_stream: [
        turbo_stream.append("streets_#{params[:address_id]}", partial: 'streets/form',
                            locals: { street: street, method: :patch, url: store_street_path(id: street, address_id: @address) }),
        success_notice(msg)
      ]
    else
      error_notice(street.errors.full_messages)
    end
  end

  def update
    if @street.update(title: params[:street][:title])
      msg = "Улица #{@street.title} была успешно обновлена."
      render turbo_stream: [
        turbo_stream.replace("street_#{@street.id}", partial: 'streets/form',
                             locals: { street: @street, method: :patch, url: store_street_path(id: @street, address_id: @address) }),
        success_notice(msg)
      ]
    else
      error_notice(@street.errors.full_messages)
    end
  end

  def destroy
    if @street.destroy
      msg = "Улица #{@street.title} была успешно удалена."
      render turbo_stream: [turbo_stream.remove(@street), success_notice(msg)]
    else
      error_notice(@street.errors.full_messages)
    end
  end

  private

  def set_address
    store    = current_user.stores.find(params[:store_id])
    @address = store.addresses.find(params[:address_id]) if store
  end

  def set_street
    @street = @address.streets.find(params[:id]) if @address
  end
end
