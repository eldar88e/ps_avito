class AddUniqKeyToVarToSettings < ActiveRecord::Migration[7.1]
  def change
    add_index :settings, :var, unique: true
  end
end
