class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform
    #sites  = %w[open_ps open_ps_store alexander]
    stores = Store.includes(:addresses).where(active: true, addresses: { active: true })
    stores.each do |store|
      AddWatermarkJob.perform_now(store: store)
      #PopulateGoogleSheetsJob.perform_now(site: site)
      # #######
      # PopulateExcelJob.perform_now(store: store)
      # ######
    end

    nil
  end
end
