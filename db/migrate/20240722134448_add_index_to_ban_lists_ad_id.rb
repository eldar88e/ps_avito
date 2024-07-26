class AddIndexToBanListsAdId < ActiveRecord::Migration[7.1]
  def change
    add_index :ban_lists, :ad_id, unique: true
  end
end
