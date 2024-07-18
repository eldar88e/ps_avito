module Avito
  class DashboardController < ApplicationController
    before_action :set_weekdays
    before_action :set_store
    before_action :set_avito
    before_action :set_auto_load
    layout 'avito'

    def index
      report = @avito.connect_to('https://api.avito.ru/autoload/v2/reports/last_completed_report')
      return error_notice("Ошибка подключения к API Avito") if report.nil? || report.status != 200

      @report = JSON.parse(report.body)
      account = @avito.connect_to('https://api.avito.ru/core/v1/accounts/self')
      return error_notice("Ошибка подключения к API Avito") if account.nil? || account.status != 200

      @account = JSON.parse(account.body)
    end

    private

    def set_avito
      @avito = AvitoService.new(store: @store)
    end

    def set_auto_load
      response = @avito.connect_to('https://api.avito.ru/autoload/v1/profile')
      return error_notice("Ошибка подключения к API Avito") if response&.status != 200

      @auto_load = JSON.parse(response.body)
    end

    def set_weekdays
      @weekdays = [{ id: 0, name: 'Понедельник'}, { id: 1, name: 'Вторник'}, { id: 2, name: 'Среда'},
                   { id: 3, name: 'Четверг'}, { id: 4, name: 'Пятница'},
                   { id: 5, name: 'Суббота'}, { id: 6, name: 'Воскресенье'}]
    end

    def set_store
      @store = current_user.stores.find(params[:store_id])
      if @store&.client_id&.present? && @store&.client_secret&.present?
        @store
      else
        msg = "Не задан для магазина client_id или client_secret или магазин отсутствует в базе"
        #redirect_to avitos_path, alert: msg
        error_notice msg
      end
    end
  end
end