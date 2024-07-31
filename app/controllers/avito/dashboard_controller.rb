module Avito
  class DashboardController < ApplicationController
    include AvitoConcerns
    add_breadcrumb "Dashboard", :store_avito_dashboard_path
    layout 'avito'

    def index
      @account   = fetch_cached("account_#{@store.id}", 'https://api.avito.ru/core/v1/accounts/self')
      @auto_load = fetch_cached("auto_load_#{@store.id}", 'https://api.avito.ru/autoload/v1/profile')
      @report    = fetch_cached("report_#{@store.id}",
                                'https://api.avito.ru/autoload/v2/reports/last_completed_report')
    rescue => e
       Rails.logger.error e.message
       error_notice e
    end

    private

    def fetch_cached(cache_key, url)
      Rails.cache.fetch(cache_key, expires_in: 5.minutes) { fetch_and_parse(url) }
    end
  end
end