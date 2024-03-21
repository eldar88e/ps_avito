class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    # sites  = %w[open_ps open_ps_store alexander]
    stores   = Store.includes(:addresses).where(active: true, addresses: { active: true })
    settings = Setting.pluck(:var, :value).to_h
    clean    = args[:clean]
    stores.each do |store|
      AddWatermarkJob.perform_now(store: store, settings: settings, clean: clean)
      #PopulateGoogleSheetsJob.perform_now(site: site)
      PopulateExcelJob.perform_now(store: store)
    end

    nil
  end
end
