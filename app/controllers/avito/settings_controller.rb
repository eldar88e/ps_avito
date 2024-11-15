class Avito::SettingsController < ApplicationController
  include AvitoConcerns
  before_action :set_webhook_url
  before_action :set_stores, only: [:index]
  layout 'avito'

  def index
    subscriptions_url = 'https://api.avito.ru/messenger/v1/subscriptions'
    @subscriptions    = fetch_and_parse(subscriptions_url, :post, {})['subscriptions']
  end

  def update
    url =
      if params[:subscription_del]
        'https://api.avito.ru/messenger/v1/webhook/unsubscribe'
      else
        'https://api.avito.ru/messenger/v3/webhook'
      end
    result = fetch_and_parse(url, :post, { url: @webhook_url })
    return error_notice('Ошибка обновления webhook.') unless result['ok']

    flash[:notice] = 'Успешно обновлены настройки webhook.'
    redirect_to "/stores/#{@store.id}/avito/webhooks/receive"
  end

  private

  def set_webhook_url
    @webhook_url = "http://server.open-ps.ru/stores/#{@store.id}/avito/webhooks/receive"
  end
end
