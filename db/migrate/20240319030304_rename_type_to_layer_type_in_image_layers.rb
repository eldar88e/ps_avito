class RenameTypeToLayerTypeInImageLayers < ActiveRecord::Migration[7.1]
  def change
    rename_column :image_layers, :type, :layer_type
  end
end
