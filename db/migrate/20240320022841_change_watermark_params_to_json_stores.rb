class ChangeWatermarkParamsToJsonStores < ActiveRecord::Migration[7.1]
  def change
    # { 'pos_x'=>448, 'pos_y'=>208 }
    remove_column :stores, :watermark_params, :string
    add_column :stores, :game_img_params, :jsonb, default: nil
  end
end
