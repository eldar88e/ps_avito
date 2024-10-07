class CacheReport < ActiveRecord::Migration[7.1]
  def change
    create_table :cache_reports do |t|
      t.references :user, null: false, foreign_key: true
      t.references :store, null: false, foreign_key: true
      t.integer :report_id, null: false
      t.jsonb :report, null: false
      t.jsonb :fees

      t.timestamps
    end

    add_index :cache_reports, [:user_id, :store_id, :report_id], unique: true
    add_index :cache_reports, :report_id
  end
end
