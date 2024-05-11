class AddContactMethodColumnToProducts < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :contact_method, :string
  end
end
