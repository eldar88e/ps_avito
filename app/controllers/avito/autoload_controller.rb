module Avito
  class AutoloadController < ApplicationController
    include AvitoConcerns
    before_action :ensure_turbo_stream_request, only: [:edit, :show]
    before_action :set_auto_load, only: [:show, :edit]
    layout 'avito'

    def show
      @report = fetch_and_parse 'https://api.avito.ru/autoload/v2/reports/last_completed_report'
      @tz     = TZInfo::Timezone.get(Rails.application.config.time_zone)
    end

    def edit
      render turbo_stream: [turbo_stream.replace(@store, partial: '/avito/autoload/edit')]
    end

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
        set_auto_load
        msg = 'Успешно обновлены настройки автозагрузки'
        render turbo_stream: [turbo_stream.replace(@store, partial: '/avito/autoload/show'), success_notice(msg)]
      else
        error_notice "Ошибка параметров JSON. Настройки автозагрузки не были изменены."
      end
    end

    def update_ads
      result = @avito.connect_to('https://api.avito.ru/autoload/v1/upload', method=:post)
      if result&.status == 200
        render turbo_stream: success_notice('Успешно запущен процес обновления обявлений из Excel-feed.')
      else
        error_notice('Ошибка запуска обновления!')
      end
    end

    private

    def ensure_turbo_stream_request
      redirect_to store_avito_dashboard_path unless turbo_frame_request?
    end

    def set_auto_load
      @auto_load = fetch_and_parse 'https://api.avito.ru/autoload/v1/profile'
    end

    def autoload_params
      params.require(:store).permit(:upload_url, :report_email)
    end
  end
end