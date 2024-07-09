class RenameStoreAddressToCityInAddresses < ActiveRecord::Migration[7.1]
  def change
    rename_column :addresses, :store_address, :city
  end
end
