class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(*args)
    sites   = %w[open_ps open_ps_store alexander]
    rewrite = Setting.pluck(:var, :value).to_h['rewrite_image'] == 'false' ? false : true
    sites.each do |site|
      AddWatermarkJob.perform_now(site: site, rewrite: rewrite)
      PopulateGoogleSheetsJob.perform_now(site: site)
    end
  end
end
