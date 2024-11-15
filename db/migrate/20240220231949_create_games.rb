class CreateGames < ActiveRecord::Migration[7.1]
  def change
    create_table :games do |t|
      t.string 'name', null: false
      t.string 'sony_id', null: false
      t.boolean 'rus_voice', default: false, null: false
      t.boolean 'rus_screen', default: false, null: false
      t.bigint 'price', null: false
      t.bigint 'old_price', default: nil
      t.date 'discount_end_date', default: nil
      t.string 'platform', null: false
      t.bigint 'top', null: false
      t.bigint 'run_id', null: false
      t.bigint 'touched_run_id', null: false
      t.string 'md5_hash', null: false

      t.timestamps
    end

    add_index :games, :run_id
    add_index :games, :touched_run_id
    add_index :games, :md5_hash, unique: true
    add_index :games, :sony_id, unique: true
  end
end
