class AddDescGameAndDescProductToStores < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :desc_game, :text
    add_column :stores, :desc_product, :text
  end
end
