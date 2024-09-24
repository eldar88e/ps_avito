class RemoveGameFromAds < ActiveRecord::Migration[7.1]
  def change
    remove_reference :ads, :game, null: false, foreign_key: true
  end
end
