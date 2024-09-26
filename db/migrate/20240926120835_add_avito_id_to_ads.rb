class AddAvitoIdToAds < ActiveRecord::Migration[7.1]
  def change
    add_column :ads, :avito_id, :integer

    add_index :ads, [:store_id, :avito_id]
  end
end
