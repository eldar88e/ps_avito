class AddMenuindexColumnToStore < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :menuindex, :integer, default: 0
  end
end
