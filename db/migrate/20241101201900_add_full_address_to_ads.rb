class AddFullAddressToAds < ActiveRecord::Migration[7.1]
  def change
    add_column :ads, :full_address, :string
  end
end
