module Avito
  class ReportsController < ApplicationController
    before_action :set_store
    before_action :set_avito

    add_breadcrumb "Главная", :root_path
    add_breadcrumb "Avito", :store_avito_path
    add_breadcrumb "Reports", :store_avito_reports_path
    layout 'avito'

    def index
      report =
        if params['page'].blank? || params['page'] == '0'
          @avito.connect_to('https://api.avito.ru/autoload/v2/reports')
        else
          @avito.connect_to("https://api.avito.ru/autoload/v2/reports?page=#{params['page']}")
        end

      return error_notice("Ошибка подключения к API Avito") if report.nil? || report.status != 200

      @reports = JSON.parse(report.body)
    end

    def show
      if params['sections'].present? && params['sections'] == 'nil'
        session[:sections] = nil
        params['sections'] = nil
      elsif params['sections'].present?
        session[:sections] = params['sections']
      elsif session[:sections].present?
        params['sections'] = session[:sections]
      end

      avito_url = "https://api.avito.ru/autoload/v2/reports/#{params['id']}"
      unless turbo_frame_request?
        report = @avito.connect_to(avito_url)
        return error_notice("Ошибка подключения к API Avito") if report.nil? || report.status != 200

        @report = JSON.parse(report.body)
        money   = @avito.connect_to("#{avito_url}/items/fees")
        return error_notice("Ошибка подключения к API Avito") if money.nil? || money.status != 200

        @money = JSON.parse(money.body)

        add_breadcrumb @report['report_id']
      end

      items_url = "#{avito_url}/items?sections=#{params['sections']}&page=#{params['page']}"
      items     = @avito.connect_to(items_url)
      return error_notice("Ошибка подключения к API Avito") if items.nil? || items.status != 200

      @items = JSON.parse(items.body)

      # "https://api.avito.ru/autoload/v2/reports/items?query=EB0094-CUSA48135_00-0551066418730933_9_41"

      if turbo_frame_request?
        return render turbo_stream: turbo_stream.update(:reports, partial: '/avito/reports/item_page')
      end
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

    def set_time_slots
      @time_slots = [*0..23].map { |i| { id: i, name: "#{i}:00-#{i+1}:00" } }
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