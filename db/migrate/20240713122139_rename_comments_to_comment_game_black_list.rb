class RenameCommentsToCommentGameBlackList < ActiveRecord::Migration[7.1]
  def change
    rename_column :game_black_lists, :comments, :comment
  end
end
