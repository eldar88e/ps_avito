module Avito
  class AutoloadController < ApplicationController
    include AvitoConcerns
    before_action :ensure_turbo_stream_request, only: [:edit, :show]
    before_action :set_auto_load, only: [:show, :edit]
    layout 'avito'

    def show
      @report = fetch_and_parse 'https://api.avito.ru/autoload/v2/reports/last_completed_report'
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
      keys_to_include = %i[upload_url report_email]
      avito_json.merge! autoload_params.slice(*keys_to_include)
      result = @avito.connect_to('https://api.avito.ru/autoload/v1/profile', :post, avito_json)

      if result&.status == 200
        set_auto_load
        Rails.cache.delete("auto_load_#{@store.id}")
        msg = t 'avito.notice.upd_autoload_conf'
        render turbo_stream: [turbo_stream.replace(@store, partial: '/avito/autoload/show'), success_notice(msg)]
      else
        error_notice t('avito.error.upd_autoload_conf')
      end
    end

    def update_ads
      result = @avito.connect_to('https://api.avito.ru/autoload/v1/upload', :post)
      if result&.status == 200
        render turbo_stream: success_notice(t 'avito.notice.upd_ads')
      else
        error_notice(t 'avito.error.upd_ads')
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
      params.require(:store).permit(:upload_url, :report_email, :autoload_enabled, :rate, weekdays: [], time_slots: [])
    end
  end
end