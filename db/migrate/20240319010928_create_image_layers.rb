class CreateImageLayers < ActiveRecord::Migration[7.1]
  def change
    create_table :image_layers do |t|
      t.string 'title'
      t.json 'params'
      t.integer 'type', default: 0
      t.references :store, null: false, foreign_key: true

      t.timestamps
    end
  end
end
