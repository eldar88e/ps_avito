class AddSloganParamColumnToAddresses < ActiveRecord::Migration[7.1]
  def change
    add_column :addresses, :slogan_params, :jsonb, default: nil
  end
end
