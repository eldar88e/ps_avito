class AddUserIdAds < ActiveRecord::Migration[7.1]
  def change
    add_reference :ads, :user, foreign_key: true, index: true
  end
end
