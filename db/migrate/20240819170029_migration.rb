class Migration < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :percent, :integer, default: 0, null: false
  end
end
