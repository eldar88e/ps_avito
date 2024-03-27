class ImageLayersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_layer, only: [:update, :destroy]

  def create
    layer = Store.find(params[:store_id]).image_layers.build(image_layer_params)

    if layer.save
      msg = ["Слой под номером #{layer.menuindex} был успешно добавлен."]
      msg << 'Внимание слой не активен!' if image_layer_params[:active].to_i.zero?
      render turbo_stream: [
        turbo_stream.append(:layers, partial: 'image_layers/image_layer', locals: { image_layer: layer }),
        success_notice(msg)
      ]
    else
      error_notice(layer.errors.full_messages)
    end
  end

  def update
    if @layer.update(image_layer_params)
      msg = ["Слой под номером #{@layer.menuindex} был успешно обновлен."]
      msg << 'Внимание слой не активен!' if image_layer_params[:active].to_i.zero?
      render turbo_stream: [
        turbo_stream.replace("layer_#{@layer.id}", partial: 'image_layers/image_layer', locals: { image_layer: @layer }),
        success_notice(msg)
      ]
    else
      error_notice(@layer.errors.full_messages)
    end
  end

  def destroy
    if @layer.destroy
      msg = "Слой #{@layer.menuindex} был успешно удален."
      render turbo_stream: [ turbo_stream.remove("layer_#{@layer.id}"), success_notice(msg)]
    else
      error_notice(@layer.errors.full_messages)
    end
  end

  private

  def set_layer
    @layer = ImageLayer.find(params[:id])
  end

  def image_layer_params
    params.require(:image_layer).permit(:layer_type, :title, :menuindex, :layer_params, :layer, :active)
  end
end
