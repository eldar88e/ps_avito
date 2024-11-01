module Avito
  class DashboardController < ApplicationController
    include AvitoConcerns
    before_action :set_account, :set_rate
    add_breadcrumb "Dashboard", :store_avito_dashboard_path
    layout 'avito'

    def index
      @auto_load = fetch_cached("auto_load_#{@store.id}", url: 'https://api.avito.ru/autoload/v1/profile')
      @report    = fetch_cached("report_#{@store.id}",
                                url: 'https://api.avito.ru/autoload/v2/reports/last_completed_report')
      @bal       = fetch_cached( "bal_#{@store.id}",
                                 url: 'https://api.avito.ru/cpa/v2/balanceInfo', method: :post, payload: {})
      @balance   = fetch_cached("balance_#{@store.id}",
                                url: "https://api.avito.ru/core/v1/accounts/#{@account['id']}/balance/")
      # return error_notice(@report[:error]) if @report[:error]
    end
  end
end