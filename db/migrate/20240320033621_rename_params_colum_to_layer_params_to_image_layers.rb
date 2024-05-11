class RenameParamsColumToLayerParamsToImageLayers < ActiveRecord::Migration[7.1]
  def change
    rename_column :image_layers, :params, :layer_params
  end
end
