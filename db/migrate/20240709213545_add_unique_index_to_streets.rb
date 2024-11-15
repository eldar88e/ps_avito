class AddUniqueIndexToStreets < ActiveRecord::Migration[7.1]
  def change
    add_index :streets, %i[address_id title], unique: true
  end
end
