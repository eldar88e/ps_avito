class AddUserIdToStores < ActiveRecord::Migration[7.1]
  def change
    add_reference :stores, :user, foreign_key: true # TODO add null: false
  end
end
