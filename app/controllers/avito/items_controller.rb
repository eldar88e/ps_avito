module Avito
  class ItemsController < ApplicationController
    before_action :set_store
    before_action :set_avito

    add_breadcrumb "Главная", :root_path
    add_breadcrumb "Avito", :store_avito_path

    layout 'avito'

    def index
      add_breadcrumb @store.manager_name, store_avito_dashboard_path(@store)

      items = @avito.connect_to(
        "https://api.avito.ru/core/v1/items?page=#{params['page']}&per_page=#{params['per_page'] || 100}"
      )
      return error_notice("Ошибка подключения к API Avito") if items.nil? || items.status != 200

      @items = JSON.parse(items.body)
    end

    private

    def set_avito
      @avito = AvitoService.new(store: @store)
    end

    def set_store
      @store = current_user.stores.find(params[:store_id])
      if @store&.client_id&.present? && @store&.client_secret&.present?
        @store
      else
        msg = "Не задан для магазина client_id или client_secret или магазин отсутствует в базе"
        error_notice msg
      end
    end
  end
end