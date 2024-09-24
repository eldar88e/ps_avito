class MakeStoreIdAddressIdUserIdNotNullableInAds < ActiveRecord::Migration[7.1]
  def change
    change_column :ads, :store_id, :bigint, null: false
    change_column :ads, :address_id, :bigint, null: false
    change_column :ads, :user_id, :bigint, null: false
  end
end
