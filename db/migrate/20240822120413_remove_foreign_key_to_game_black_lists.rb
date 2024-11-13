class RemoveForeignKeyToGameBlackLists < ActiveRecord::Migration[7.1]
  def change
    remove_foreign_key :game_black_lists, :games
    # remove_reference :game_black_lists, :game, foreign_key: true
    # add_reference(:game_black_lists, :game, type: :string, index: { unique: true })
    change_column :game_black_lists, :game_id, :string, null: false
  end
end
