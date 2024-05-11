class AddDescriptionColumnToAddresses < ActiveRecord::Migration[7.1]
  def change
    add_column :addresses, :description, :string, default: nil
  end
end
