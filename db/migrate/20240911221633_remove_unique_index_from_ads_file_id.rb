class RemoveUniqueIndexFromAdsFileId < ActiveRecord::Migration[7.1]
  def change
    remove_index :ads, :file_id, unique: true
    add_index :ads, :file_id
  end
end
