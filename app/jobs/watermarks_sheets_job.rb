class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform
    #sites  = %w[open_ps open_ps_store alexander]
    stores = Store.all
    stores.each do |store|
      AddWatermarkJob.perform_now(site: store.var)
      #PopulateGoogleSheetsJob.perform_now(site: site)
      PopulateExcelJob.perform_now(store: store)
    end

    nil
  end
end
