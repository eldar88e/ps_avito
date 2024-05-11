class AddTypeToStores < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :type, :string
  end
end
