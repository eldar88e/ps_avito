module Avito
  class ItemsController < ApplicationController
    include AvitoConcerns
    layout 'avito'

    def index
      add_breadcrumb @store.manager_name, store_avito_dashboard_path
      add_breadcrumb 'Items', store_avito_items_path
      url    = "https://api.avito.ru/core/v1/items?page=#{params['page']}&per_page=#{params['per_page'] || 100}"
      @items = fetch_and_parse url
    end
  end
end