class StoresController < ApplicationController
  before_action :authenticate_user!
  before_action :set_store, only: [:show, :edit, :update, :destroy]

  def index
    @stores = Store.all
  end

  def show
    @image_layers = @store.image_layers.order(:menuindex, :id)
    @layer        = ImageLayer.new
    @addresses    = @store.addresses.order(:id)
    @address      = Address.new
  end

  def new
    @store = Store.new
  end

  def create
    @store = Store.new(store_params)

    if @store.save
      msg = ["Магазин #{@store.manager_name} был успешно добавлен."]
      msg << 'Внимание магазин не активен!' if store_params[:active].to_i.zero?
      flash[:success] = msg
      redirect_to @store
    else
      error_notice(@store.errors.full_messages)
    end
  end

  def edit; end

  def update
    if @store.update(store_params)
      msg = ["Магазин #{@store.manager_name} был успешно обновлен."]
      msg << 'Внимание магазин не активен!' if store_params[:active].to_i.zero?
      flash[:success] = msg
      redirect_to @store
    else
      error_notice(@store.errors.full_messages)
    end
  end

  def destroy
    if @store.destroy
      msg = "Магазин #{@store.manager_name} был успешно удален."
      render turbo_stream: [ turbo_stream.remove("store_#{@store.id}"), success_notice(msg)]
    else
      error_notice(@store.errors.full_messages)
    end
  end

  private

  def set_store
    @store = Store.find(params[:id])
  end

  def store_params
    params.require(:store)
          .permit(:manager_name, :var, :ad_status, :category, :goods_type, :ad_type, :type, :desc_game,
                  :menuindex, :active, :contact_method, :description, :condition, :desc_product,
                  :allow_email, :contact_phone, :game_img_params, :table_id)
  end
end
