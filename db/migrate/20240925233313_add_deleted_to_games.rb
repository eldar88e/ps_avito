class AddDeletedToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :deleted, :integer, default: 0, null: false
  end
end
