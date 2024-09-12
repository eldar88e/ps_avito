class CreateAds < ActiveRecord::Migration[7.1]
  def change
    create_table :ads do |t|
      t.references :store, foreign_key: true
      t.references :address, foreign_key: true
      t.references :game, foreign_key: true
      t.string :file_id, null: false

      t.timestamps
    end

    add_index :ads, :file_id, unique: true
  end
end
