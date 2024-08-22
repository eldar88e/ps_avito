class AddForeignKeyToGameBlackListsNoCaskad < ActiveRecord::Migration[7.1]
  def change
    remove_foreign_key :game_black_lists, :games
  end
end
