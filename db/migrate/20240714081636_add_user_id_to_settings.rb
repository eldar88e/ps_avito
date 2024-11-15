class AddUserIdToSettings < ActiveRecord::Migration[7.1]
  def change
    add_reference :settings, :user, foreign_key: true # TODO: add null: false
  end
end
