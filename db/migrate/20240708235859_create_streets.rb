class CreateStreets < ActiveRecord::Migration[7.1]
  def change
    create_table :streets do |t|
      t.string :title
      t.references :address, null: false, foreign_key: true

      t.timestamps
    end
  end
end
