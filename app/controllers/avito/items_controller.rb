module Avito
  class ItemsController < ApplicationController
    include AvitoConcerns
    layout 'avito'

    def index
      add_breadcrumb @store.manager_name, store_avito_dashboard_path
      add_breadcrumb 'Items', store_avito_items_path
      page     = params['page'].to_i.zero? ? 1 : params['page'].to_i
      per_page = params['per_page'] || 100
      url      = "https://api.avito.ru/core/v1/items?page=#{page}&per_page=#{per_page}"
      @items   = fetch_and_parse url

      session["store_#{@store.id}_size"] ||= @items['resources'].size if page == 1
      @size = session["store_#{@store.id}_size"] || per_page
      if @items['resources'].size == per_page && page >= session["store_#{@store.id}_end_page"]
        session["store_#{@store.id}_end_page"] = page + 1
      end
      @end_page = session["store_#{@store.id}_end_page"] || 1
    end
  end
end