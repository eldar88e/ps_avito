class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string 'title', null: false
      t.text 'description', null: false
      t.integer 'price', null: false
      t.string 'ad_status', default: nil
      t.string 'category', default: nil
      t.string 'goods_type', default: nil
      t.string 'ad_type', default: nil
      t.string 'condition', default: nil
      t.string 'allow_email', default: nil

      t.timestamps
    end
  end
end
