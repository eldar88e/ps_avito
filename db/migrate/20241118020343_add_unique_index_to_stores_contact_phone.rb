class AddUniqueIndexToStoresContactPhone < ActiveRecord::Migration[7.1]
  def change
    add_index :stores, :contact_phone, unique: true
  end
end
