class AddTypeToProducts < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :type, :string
    add_column :products, :platform, :string
    add_column :products, :localization, :string
  end
end
