class CreateAvitoTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :avito_tokens do |t|
      t.references :store, null: false, foreign_key: true

      t.string :access_token, null: false
      t.integer :expires_in, null: false
      t.string :token_type, null: false

      t.timestamps
    end
  end
end
