class AddActiveColumToStores < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :active, :boolean, default: false, null: false
  end
end
