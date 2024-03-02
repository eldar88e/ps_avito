class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform
    sites = %w[open_ps open_ps_store alexander]
    sites.each do |site|
      #ActiveJob.perform_all_later(AddWatermarkJob.new(site: site, rewrite: rewrite),  PopulateGoogleSheetsJob.new(site: site))
      AddWatermarkJob.perform_now(site: site)
      PopulateGoogleSheetsJob.perform_now(site: site)
      PopulateExcelJob.perform_now(site: site)
      TelegramService.new("✅ Google sheet and Excel for #{site} is done!").report
    end
  end
end
