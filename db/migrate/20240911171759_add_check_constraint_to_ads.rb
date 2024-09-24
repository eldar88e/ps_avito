class AddCheckConstraintToAds < ActiveRecord::Migration[7.1]
  def change
    execute <<-SQL
      ALTER TABLE ads
      ADD CONSTRAINT check_deleted_value
      CHECK (deleted IN (0, 1));
    SQL
  end
end
