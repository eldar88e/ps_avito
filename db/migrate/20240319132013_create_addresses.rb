class CreateAddresses < ActiveRecord::Migration[7.1]
  def change
    create_table :addresses do |t|
      t.references :store, null: false, foreign_key: true
      t.string 'store_address', null: false
      t.string 'slogan', default: nil

      t.timestamps
    end
  end
end
