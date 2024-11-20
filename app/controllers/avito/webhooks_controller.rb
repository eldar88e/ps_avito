module Avito
  class WebhooksController < ApplicationController
    skip_before_action :verify_authenticity_token

    def receive
      data    = request.body.read
      webhook = JSON.parse(data)
      return head :ok if user_is_author?(webhook)

      broadcast_notify webhook['payload']['value']['content']['text']
      render json: { status: 'ok' }, status: :ok # head :ok
    rescue StandardError => e
      render json: { error: e.message }, status: :not_found
      broadcast_notify(e.message, 'danger')
      TelegramService.call(User.first, e.message)
    end

    private

    def user_is_author?(webhook)
      webhook.dig('payload', 'value', 'user_id') == webhook.dig('payload', 'value', 'author_id')
    end

    def broadcast_notify(message, key = 'success')
      Turbo::StreamsChannel.broadcast_append_to(
        :notify,
        target: :notices,
        partial: '/notices/notice',
        locals: { notices: message, key: }
      )
    end
  end
end
