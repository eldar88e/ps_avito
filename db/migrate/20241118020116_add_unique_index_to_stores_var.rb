class AddUniqueIndexToStoresVar < ActiveRecord::Migration[7.1]
  def change
    add_index :stores, [:var, :user_id], unique: true
  end
end
