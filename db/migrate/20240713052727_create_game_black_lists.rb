class CreateGameBlackLists < ActiveRecord::Migration[7.1]
  def change
    create_table :game_black_lists do |t|
      t.string :game_id
      t.string :comments

      t.timestamps
    end

    add_index :game_black_lists, :game_id, unique: true
    add_foreign_key :game_black_lists, :games, column: :game_id, primary_key: :sony_id
  end
end
