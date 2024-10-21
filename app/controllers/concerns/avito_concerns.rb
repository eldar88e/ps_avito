module AvitoConcerns
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
    before_action :set_store_and_check
    before_action :set_avito
    add_breadcrumb "Главная", :root_path
    add_breadcrumb "Avito", :avitos_path
  end

  private

  def fetch_and_parse(url, method=:get, payload=nil)
    response = @avito.connect_to(url, method, payload)

    #raise StandardError, "Ошибка подключения к API Avito. Status: #{response&.status}" if response&.status != 200
    return error_notice("Ошибка подключения к API Avito. Status: #{response&.status}") if response&.status != 200

    JSON.parse(response.body)
  end

  def set_store_and_check
    @store = current_user.stores.find_by(id: params[:store_id])
    if @store.nil? || @store.client_id.blank? || @store.client_secret.blank?
      error_notice t('avito.error.set_store')
    end
  end

  def set_avito
    @avito = AvitoService.new(store: @store)
    if @avito.token_status && @avito.token_status != 200
      error_notice t('avito.error.set_avito')
    end
  end
end