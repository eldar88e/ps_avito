class AvitosController < ApplicationController
  before_action :authenticate_user!

  def index
    @stores = Store.all
  end

  def show
    @store = Store.find_by(id: params[:id])
    if @store&.client_id && @store&.client_secret
      avito      = AvitoService.new(store: @store)
      response   = avito.connect_to('https://api.avito.ru/autoload/v1/profile')
      @auto_load = JSON.parse(response.body)
      report     = avito.connect_to('https://api.avito.ru/autoload/v2/reports/last_completed_report')
      @report    = JSON.parse(report.body)
    else
      msg = "Не задан для магазина client_id или client_secret или магазин отсутствует в базе"
      error_notice(msg)
    end
  end
end
