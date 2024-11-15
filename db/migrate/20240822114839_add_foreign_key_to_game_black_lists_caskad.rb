class AddForeignKeyToGameBlackListsCaskad < ActiveRecord::Migration[7.1]
  def change
    # add_reference :game_black_lists, :game, foreign_key: { to_table: :games, primary_key: :sony_id, on_delete: :nullify }
    add_foreign_key :game_black_lists, :games, column: :game_id, primary_key: :sony_id, on_delete: :nullify
  end
end
