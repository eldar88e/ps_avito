class ImageLayersController < ApplicationController
  before_action :authenticate_user!

  def create
    store_id = request.referer.split('/')[-1]
    @store   = Store.find(store_id).image_layers.build(image_layer_params)

    if @store.save
      redirect_to store_path(@store), notice: 'Layer was successfully created!'
    else
      render 'stores/show'
    end
  end

  def update
    @layer = ImageLayer.find(params[:id])
    @store = @layer.store

    if @layer.update(image_layer_params)
      redirect_to store_path(@store), alert: 'Layer edited!'
    else
      redirect_to store_path(@store), alert: 'Error editing layer!'
    end
  end

  private

  def image_layer_params
    params.require(:image_layer).permit(:layer_type, :title, :menuindex, :layer_params, :layer, :active)
  end
end
