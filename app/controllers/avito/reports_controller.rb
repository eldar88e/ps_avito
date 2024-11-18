module Avito
  class ReportsController < ApplicationController
    include AvitoConcerns
    before_action :set_breadcrumb, only: %i[index show]
    before_action :set_stores, only: [:index]
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

      return unless turbo_frame_request?

      render turbo_stream: turbo_stream.update(:reports, partial: '/avito/reports/item_page')
    end

    private

    def set_cache(url, section)
      result = @cached_report&.send(section)
      return result if result

      result = fetch_and_parse(url)
      will_pub_later = section == :fees ||
                       !result['section_stats']['sections']&.find { |i| i['slug'] == 'will_publish_later' }
      if params['no_cache'].nil? && result['status'] != 'processing' && will_pub_later
        @cached_report.public_send(:"#{section}=", result)
        @cached_report.save
      end
      result
    end

    def initialize_cache
      @cached_report = current_user.cache_reports.find_or_initialize_by(store: @store, report_id: params['id'])

      return unless params['no_cache']

      @cached_report.destroy if @cached_report.persisted?
      @cached_report = current_user.cache_reports.new(store: @store, report_id: params['id'])
    end

    def handle_sections_params
      return session[:sections] = params['sections'] = nil if params['sections'].to_s == 'nil'

      session[:sections] = params['sections'] if params['sections'].present?
      params['sections'] ||= session[:sections]
    end

    def set_breadcrumb
      add_breadcrumb @store.manager_name, store_avito_dashboard_path(@store)
      add_breadcrumb 'Reports', :store_avito_reports_path
    end
  end
end
