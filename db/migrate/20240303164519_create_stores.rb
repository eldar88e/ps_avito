class CreateStores < ActiveRecord::Migration[7.1]
  def change
    create_table :stores do |t|
      t.string "var", null: false
      t.string "ad_status", default: nil
      t.string "category", null: false
      t.string "goods_type", null: false
      t.string "ad_type", null: false
      t.string "address", null: false
      t.text "description", null: false
      t.string "condition", null: false
      t.string "allow_email", null: false
      t.string "manager_name", null: false
      t.string "contact_phone", null: false
      t.string "table_id", default: nil
      t.string "watermark_params", default: nil

      t.timestamps
    end
  end
end
