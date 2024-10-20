module Avito
  class WebhooksController < ApplicationController
    skip_before_action :verify_authenticity_token

    def receive
      data = request.body.read
      TelegramService.call(User.first, data)

      # webhook_event = JSON.parse(data)
      # Обработайте событие
      # case webhook_event['event_type']
      # when 'order_created'
      #   # Логика для события создания заказа
      # when 'order_updated'
      #   # Логика для события обновления заказа
      # else
      #   # Логика для других событий
      # end
      render json: { status: 'ok' }, status: :ok
    rescue => e
      TelegramService.call(User.first, e.message)
    end
  end
end
