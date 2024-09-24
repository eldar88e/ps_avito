class AddBannedToAds < ActiveRecord::Migration[7.1]
  def change
    add_column :ads, :banned, :boolean, default: false, null: false

    add_column :ads, :banned_until, :datetime
  end
end
