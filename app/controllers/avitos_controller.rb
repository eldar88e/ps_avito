class AvitosController < ApplicationController
  before_action :authenticate_user!
  before_action :set_weekdays, only: [:show, :edit]
  before_action :set_time_slots, only: [:show, :edit]
  before_action :set_store, only: [:show, :edit, :update, :update_ads]
  before_action :set_avito, only: [:show, :edit, :update, :update_ads]
  before_action :set_auto_load, only: [:show, :edit]
  add_breadcrumb "Главная", :root_path
  add_breadcrumb "Avito", :avitos_path

  def index
    @stores = current_user.stores.order(:created_at)
  end

  def show
    add_breadcrumb @store.manager_name, avito_path(@store)
    report = @avito.connect_to('https://api.avito.ru/autoload/v2/reports/last_completed_report')
    return error_notice("Ошибка подключения к API Avito") if report.nil? || report.status != 200

    @report    = JSON.parse(report.body)
    @tz        = TZInfo::Timezone.get(Rails.application.config.time_zone)
    #self_avito = @avito.connect_to('https://api.avito.ru/core/v1/accounts/self')
    #return error_notice("Ошибка подключения к API Avito") if self_avito.nil? || self_avito.status != 200

    #@self_avito = JSON.parse(self_avito.body)
  end

  def edit; end

  def update
    weekdays         = params[:store][:weekdays].reject(&:blank?).map { |i| i.to_i }
    time_slots       = params[:store][:time_slots].reject(&:blank?).map { |i| i.to_i }
    autoload_enabled = params[:store][:autoload_enabled] == '1'
    avito_json       = { agreement: true,
                         autoload_enabled: autoload_enabled,
                         schedule: [{ rate: params[:store][:rate].to_i, time_slots: time_slots, weekdays: weekdays }]
                        }
    avito_json.merge! autoload_params

    result = @avito.connect_to('https://api.avito.ru/autoload/v1/profile', method=:post, payload=avito_json)

    if result&.status == 200
      #render turbo_stream:  success_notice('Настройки автозагрузки была изменены.')
      redirect_to avito_path(@store) #, flash[:notice] = 'Настройки автозагрузки была изменены.'
    else
      msg = "Ошибка параметров JSON. Настройки автозагрузки не были изменены."
      error_notice(msg)
    end
  end

  def update_ads
    result = @avito.connect_to('https://api.avito.ru/autoload/v1/upload', method=:post)
    if result&.status == 200
      render turbo_stream: success_notice('Успешно запущен процес обновления обявлений из Excel-feed.'), status: :ok
    else
      error_notice('Ошибка запуска обновления!')
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
    @store = current_user.stores.find(params[:id])
    if @store&.client_id&.present? && @store&.client_secret&.present?
      @store
    else
      msg = "Не задан для магазина client_id или client_secret или магазин отсутствует в базе"
      #redirect_to avitos_path, alert: msg
      error_notice msg
    end
  end

  def autoload_params
    params.require(:store).permit(:upload_url, :report_email)
  end
end
