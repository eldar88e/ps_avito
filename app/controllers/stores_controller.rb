class StoresController < ApplicationController
  before_action :authenticate_user!

  def index
    @stores = Store.all
  end

  def show
    @store        = Store.find(params[:id])
    @image_layers = @store.image_layers.order(:menuindex)
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
      redirect_to @store, notice: 'Store was successfully created.'
    else
      render :new
    end
  end

  def edit
    @store = Store.find(params[:id])
  end

  def update
    @store = Store.find(params[:id])
    store_params[:description].squeeze!(' ')
    store_params[:description].chomp!
    if @store.update(store_params)
      redirect_to @store, notice: 'Store was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @store = Store.find(params[:id])
    notice =
      if @store&.destroy
        'Store was successfully deleted.'
      else
        'Store was not deleted!'
      end
    redirect_to stores_path, notice: notice
  end

  private

  def store_params
    params.require(:store).permit(:manager_name, :var, :ad_status, :category, :goods_type, :ad_type, :menuindex, :active,
                                  :description, :condition, :allow_email, :contact_phone, :game_img_params, :table_id)
  end
end
