class AddNotNullToCommentInGameBlackLists < ActiveRecord::Migration[7.1]
  def change
    change_column_null :game_black_lists, :comment, false
  end
end
