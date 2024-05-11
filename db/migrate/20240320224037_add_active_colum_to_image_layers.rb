class AddActiveColumToImageLayers < ActiveRecord::Migration[7.1]
  def change
    add_column :image_layers, :active, :boolean, default: false, null: false
  end
end
