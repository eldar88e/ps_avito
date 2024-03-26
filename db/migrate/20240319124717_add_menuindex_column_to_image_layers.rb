class AddMenuindexColumnToImageLayers < ActiveRecord::Migration[7.1]
  def change
    add_column :image_layers, :menuindex, :integer, default: 0
  end
end
