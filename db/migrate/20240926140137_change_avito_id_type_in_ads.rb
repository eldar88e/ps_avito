class ChangeAvitoIdTypeInAds < ActiveRecord::Migration[7.1]
  def change
    change_column :ads, :avito_id, :bigint

    remove_index :ads, name: 'index_ads_on_store_id_and_avito_id'

    add_index :ads, :avito_id
  end
end
