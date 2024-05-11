class AddPriceTlToGame < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :price_tl, :bigint, default: 0, null: false
  end
end
