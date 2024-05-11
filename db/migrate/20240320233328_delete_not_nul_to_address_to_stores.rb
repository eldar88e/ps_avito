class DeleteNotNulToAddressToStores < ActiveRecord::Migration[7.1]
  def change
    change_column_null :stores, :address, true, default: nil
  end
end
