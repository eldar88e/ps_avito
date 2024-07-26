class CreateBanLists < ActiveRecord::Migration[7.1]
  def change
    create_table :ban_lists do |t|
      t.references :store, null: false, foreign_key: true
      t.string :ad_id
      t.datetime :expires_at

      t.timestamps
    end
  end
end
