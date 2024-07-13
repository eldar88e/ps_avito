class AddNotNullToGameBlackList < ActiveRecord::Migration[7.1]
  def change
    change_column_null :game_black_lists, :game_id, false
  end
end
