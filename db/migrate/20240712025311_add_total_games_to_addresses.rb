class AddTotalGamesToAddresses < ActiveRecord::Migration[7.1]
  def change
    add_column :addresses, :total_games, :integer
  end
end
