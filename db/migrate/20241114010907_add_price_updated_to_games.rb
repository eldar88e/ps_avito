class AddPriceUpdatedToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :price_updated, :bigint
  end
end
