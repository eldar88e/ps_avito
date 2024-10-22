class ImageLayersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_store, only: [:new, :create, :update, :destroy]
  before_action :set_layer, only: [:update, :destroy]

  def new
    @image_layer = @store.image_layers.build
    render turbo_stream: [
      turbo_stream.prepend(:image_layers, partial: 'image_layers/new'),
      turbo_stream.remove(:new_image_layer_btn)
    ]
  end

  def create
    layer = @store.image_layers.build(image_layer_params)

    if layer.save
      msg = ["Слой под номером #{layer.menuindex} был успешно добавлен."]
      msg << 'Внимание слой не активен!' if image_layer_params[:active].to_i.zero?
      render turbo_stream: [
        turbo_stream.append(:image_layers, partial: 'image_layers/image_layer', locals: { image_layer: layer }),
        turbo_stream.remove(:new_image_layers),
        turbo_stream.before(:image_layers, partial: 'image_layers/new_image_layer_btn', locals: { store: layer.store }),
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
        turbo_stream.replace("image_layer_#{@layer.id}", partial: 'image_layers/image_layer', locals: { image_layer: @layer }),
        success_notice(msg)
      ]
    else
      error_notice(@layer.errors.full_messages)
    end
  end

  def destroy
    if @layer.destroy
      msg = "Слой #{@layer.menuindex} был успешно удален."
      render turbo_stream: [ turbo_stream.remove("image_layer_#{@layer.id}"), success_notice(msg)]
    else
      error_notice(@layer.errors.full_messages)
    end
  end

  private

  def set_layer
    @layer = @store.image_layers.find(params[:id])
  end

  def image_layer_params
    params.require(:image_layer).permit(:layer_type, :title, :menuindex, :layer_params, :layer, :active)
  end
end
