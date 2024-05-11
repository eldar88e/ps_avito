class AddContactMethodColumnToStores < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :contact_method, :string
  end
end
