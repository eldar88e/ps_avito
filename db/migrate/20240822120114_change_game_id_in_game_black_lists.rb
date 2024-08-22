class ChangeGameIdInGameBlackLists < ActiveRecord::Migration[7.1]
  def change
    change_column :game_black_lists, :game_id, :string, null: true
  end
end
