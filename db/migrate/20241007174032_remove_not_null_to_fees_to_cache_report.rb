class RemoveNotNullToFeesToCacheReport < ActiveRecord::Migration[7.1]
  def change
    change_column_null :cache_reports, :fees, true
  end
end
