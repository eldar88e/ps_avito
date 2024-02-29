class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(*args)
    sites = %w[open_ps open_ps_store alexander]
    sites.each do |site|
      AddWatermarkJob.perform_now(site: site, rewrite: true)
      PopulateGoogleSheetsJob.perform_now(site: site)
    end
  end
end
