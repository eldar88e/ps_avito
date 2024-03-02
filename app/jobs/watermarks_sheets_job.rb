class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    sites   = %w[open_ps open_ps_store alexander]
    #rewrite = Setting.pluck(:var, :value).to_h['rewrite_image'] == 'false' ? false : true
    sites.each do |site|
      #ActiveJob.perform_all_later(AddWatermarkJob.new(site: site, rewrite: rewrite),  PopulateGoogleSheetsJob.new(site: site))
      AddWatermarkJob.perform_now(site: site)
      PopulateGoogleSheetsJob.perform_now(site: site)
      TelegramService.new("✅ Google sheet for #{site} is done!").report
    end
  end
end
