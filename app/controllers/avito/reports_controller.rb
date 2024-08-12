module Avito
  class ReportsController < ApplicationController
    include AvitoConcerns
    before_action :set_breadcrumb, only: [:index, :show]
    before_action :handle_sections_params, only: [:show]
    layout 'avito'

    def index
      @reports = fetch_and_parse "https://api.avito.ru/autoload/v2/reports?page=#{params['page'].to_i}"
    end

    def show
      avito_url = "https://api.avito.ru/autoload/v2/reports/#{params['id']}"
      unless turbo_frame_request?
        initialize_cache
        @cached   = @cached_report.report.present?
        @report   = set_cache(avito_url, :report)
        money_url = "#{avito_url}/items/fees"
        @money    = set_cache(money_url, :fees)

        add_breadcrumb @report['report_id']
      end

      @items = fetch_and_parse "#{avito_url}/items?sections=#{params['sections']}&page=#{params['page'].to_i}"

      if turbo_frame_request?
        return render turbo_stream: turbo_stream.update(:reports, partial: '/avito/reports/item_page')
      end
    end

    private

    def set_cache(url, section)
      result = @cached_report&.send(section)
      return result if result

      result = fetch_and_parse(url)
      if params['no_cache'].nil? && result['status'] != 'processing'
        @cached_report.public_send("#{section}=", result)
        @cached_report.save
      end
      result
    end

    def initialize_cache
      @cached_report =
        if params['no_cache'].nil?
          CacheReport.find_or_initialize_by(report_id: params['id'], store_id: @store.id)
        else
          CacheReport.where(report_id: params['id'], store_id: @store.id).delete_all
          CacheReport.new(report_id: params['id'], store_id: @store.id)
        end
    end

    def handle_sections_params
      if params['sections'].to_s == 'nil'
        session[:sections] = params['sections'] = nil
      else
        session[:sections] = params['sections'] if params['sections'].present?
        params['sections'] ||= session[:sections]
      end
    end

    def set_breadcrumb
      add_breadcrumb @store.manager_name, store_avito_dashboard_path(@store)
      add_breadcrumb "Reports", :store_avito_reports_path
    end
  end
end