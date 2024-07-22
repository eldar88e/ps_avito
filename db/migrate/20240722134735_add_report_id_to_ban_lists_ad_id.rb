class AddReportIdToBanListsAdId < ActiveRecord::Migration[7.1]
  def change
    add_column :ban_lists, :report_id, :integer
  end
end
