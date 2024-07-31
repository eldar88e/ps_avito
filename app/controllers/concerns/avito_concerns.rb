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
    raise StandardError, "Ошибка подключения к API Avito. Status: #{response.nil? ? 'nil' : response.status}" #if response.nil? || response.status != 200

    JSON.parse(response.body)
  end

  def set_store
    @store = current_user.stores.find_by(id: params[:store_id])
    if @store.nil? || @store.client_id.blank? || @store.client_secret.blank?
      error_notice "Не задан для магазина client_id или client_secret или магазин отсутствует в базе."
    end
  end

  def set_avito
    @avito = AvitoService.new(store: @store)
    if @avito.token_status && @avito.token_status != 200
      error_notice "Ошибка обновления Авито токена! Возможно магазин заблокирован"
    end
  end
end