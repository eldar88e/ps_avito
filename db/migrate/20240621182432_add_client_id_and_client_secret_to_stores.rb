class AddClientIdAndClientSecretToStores < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :client_id, :string
    add_column :stores, :client_secret, :string
  end
end
