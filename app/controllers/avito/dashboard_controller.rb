module Avito
  class DashboardController < ApplicationController
    include AvitoConcerns
    add_breadcrumb "Dashboard", :store_avito_dashboard_path
    layout 'avito'

    def index
      @account   = fetch_cached("account_#{@store.id}", 'https://api.avito.ru/core/v1/accounts/self', expires_in: 6.hour)
      @auto_load = fetch_cached("auto_load_#{@store.id}", 'https://api.avito.ru/autoload/v1/profile')
      @report    = fetch_cached("report_#{@store.id}",
                                'https://api.avito.ru/autoload/v2/reports/last_completed_report')
      #@report = fetch_and_parse('https://api.avito.ru/autoload/v2/reports/last_completed_reportddf')
      @bal       = fetch_cached( "bal_#{@store.id}", 'https://api.avito.ru/cpa/v2/balanceInfo', method: :post, payload: {})
      @balance   = fetch_cached("balance_#{@store.id}", "https://api.avito.ru/core/v1/accounts/#{@account['id']}/balance/")
      @rate      = fetch_cached("rate_#{@store.id}", 'https://api.avito.ru/ratings/v1/info', expires_in: 1.hour)
    rescue => e
       Rails.logger.error e.message
       error_notice e
    end

    private

    def fetch_cached(cache_key, url, **args)
      method     = args[:method] || :get
      expires_in = args[:expires_in] || 5.minutes
      Rails.cache.fetch(cache_key, expires_in: expires_in) { fetch_and_parse(url, method, args[:payload]) }
    end
  end
end