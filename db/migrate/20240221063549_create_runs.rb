class CreateRuns < ActiveRecord::Migration[7.1]
  def change
    create_table :runs do |t|
      t.string 'status', default: 'processing', null: false

      t.timestamps
    end

    add_index :runs, :status
  end
end
