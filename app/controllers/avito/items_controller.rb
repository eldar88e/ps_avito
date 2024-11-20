module Avito
  class ItemsController < ApplicationController
    include AvitoConcerns
    before_action :index_breadcrumbs, :set_page_params, :set_status
    layout 'avito'

    def index
      url    = "https://api.avito.ru/core/v1/items?page=#{@page}&per_page=#{@per_page}&status=#{@status}"
      @items = fetch_and_parse url
      session["store_#{@store.id}_#{@status}_size"] ||= @items['resources'].size if @page == 1
      @size     = session["store_#{@store.id}_#{@status}_size"] || @per_page
      @end_page = fetch_end_page
    end

    private

    def fetch_end_page
      end_page_key = "store_#{@store.id}_#{@status}_end_page"
      if @items['resources'].size == @per_page && @page >= (session[end_page_key] ||= 1)
        session[end_page_key] = @page + 1
      end
      session[end_page_key] || 1
    end

    def set_status
      status_key          = "store_#{@store.id}_status"
      session[status_key] = params['status'] || session.fetch(status_key, 'active')
      @status             = session[status_key]
    end

    def set_page_params
      @page     = params['page'].to_i.zero? ? 1 : params['page'].to_i
      @per_page = params['per_page'] || 100
    end

    def index_breadcrumbs
      add_breadcrumb @store.manager_name, store_avito_dashboard_path
      add_breadcrumb 'Items', store_avito_items_path
    end
  end
end
