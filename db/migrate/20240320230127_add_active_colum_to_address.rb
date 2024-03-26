class AddActiveColumToAddress < ActiveRecord::Migration[7.1]
  def change
    add_column :addresses, :active, :boolean, default: false, null: false
  end
end
