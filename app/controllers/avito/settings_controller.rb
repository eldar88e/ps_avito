class Avito::SettingsController < ApplicationController
  include AvitoConcerns
  before_action :set_webhook_url
  layout 'avito'

  def index
    subscriptions_url = 'https://api.avito.ru/messenger/v1/subscriptions'
    @subscriptions    = fetch_and_parse(subscriptions_url, :post, {})['subscriptions']
  end

  def update
    url = if params[:subscription_del]
            'https://api.avito.ru/messenger/v1/webhook/unsubscribe'
          else
            'https://api.avito.ru/messenger/v3/webhook'
          end
    result = fetch_and_parse(url, :post, { url: @webhook_url })
    if result['ok']
      flash[:notice] = 'Успешно обновлены настройки webhook.'
      redirect_to "/stores/#{@store.id}/avito/webhooks/receive"
    else
      error_notice('Ошибка обновления webhook.')
    end
  end

  private

  def set_webhook_url
    @webhook_url = "http://server.open-ps.ru/stores/#{@store.id}/avito/webhooks/receive"
  end
end
