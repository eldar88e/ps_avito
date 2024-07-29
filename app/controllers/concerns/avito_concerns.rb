module AvitoConcerns
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
    before_action :set_store
    before_action :set_avito
    add_breadcrumb "Главная", :root_path
    add_breadcrumb "Avito", :avitos_path
  end

  private

  def fetch_and_parse(url)
    response = @avito.connect_to(url)
    return error_notice("Ошибка подключения к API Avito") if response.nil? || response.status != 200

    JSON.parse(response.body)
  end

  def set_store
    @store = current_user.stores.find(params[:store_id])
    if @store&.client_id&.present? && @store&.client_secret&.present?
      @store
    else
      msg = "Не задан для магазина client_id или client_secret или магазин отсутствует в базе."
      error_notice msg
    end
  end

  def set_avito
    @avito = AvitoService.new(store: @store)
  end
end