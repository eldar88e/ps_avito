module Avito
  class DashboardController < ApplicationController
    include AvitoConcerns
    add_breadcrumb "Dashboard", :store_avito_dashboard_path
    layout 'avito'

    def index
      @account   = fetch_and_parse 'https://api.avito.ru/core/v1/accounts/self'
      @auto_load = fetch_and_parse 'https://api.avito.ru/autoload/v1/profile'
      @report    = fetch_and_parse 'https://api.avito.ru/autoload/v2/reports/last_completed_report'
      #rescue => e
      #Rails.logger.error e.message
      #error_notice e
      #raise StandardError, e.message
    end
  end
end