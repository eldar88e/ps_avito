class AddNullConstraintToUserIdInSettings < ActiveRecord::Migration[7.1]
  def change
    change_column_null :settings, :user_id, false
  end
end
