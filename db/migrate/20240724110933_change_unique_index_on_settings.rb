class ChangeUniqueIndexOnSettings < ActiveRecord::Migration[7.1]
  def change
    remove_index :settings, :var if index_exists?(:settings, :var)

    add_index :settings, [:var, :user_id], unique: true
  end
end
