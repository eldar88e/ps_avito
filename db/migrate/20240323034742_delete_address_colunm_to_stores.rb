class DeleteAddressColunmToStores < ActiveRecord::Migration[7.1]
  def change
    remove_column :stores, :address, :string
  end
end
