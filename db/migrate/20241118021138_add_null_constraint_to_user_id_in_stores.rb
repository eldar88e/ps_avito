class AddNullConstraintToUserIdInStores < ActiveRecord::Migration[7.1]
  def change
    change_column_null :stores, :user_id, false
  end
end
