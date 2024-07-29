class AvitosController < ApplicationController
  include AvitoConcerns
  before_action :set_store, only: [:show, :edit, :update, :update_ads]
  before_action :set_avito, only: [:show, :edit, :update, :update_ads]
  before_action :set_auto_load, only: [:show, :edit]

  TIME_SLOTS = [*0..23].map { |i| { id: i, name: "#{i}:00-#{i+1}:00" } }

  def index
    @stores = current_user.stores.order(:created_at)
  end

  def show
    add_breadcrumb @store.manager_name, avito_path(@store)
    @report = fetch_and_parse 'https://api.avito.ru/autoload/v2/reports/last_completed_report'
    @tz     = TZInfo::Timezone.get(Rails.application.config.time_zone)
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
      redirect_to avito_path(@store)
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

  def set_auto_load
    @auto_load = fetch_and_parse 'https://api.avito.ru/autoload/v1/profile'
  end

  def autoload_params
    params.require(:store).permit(:upload_url, :report_email)
  end
end
