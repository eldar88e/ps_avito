class Avito::WebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token

  def receive
    data          = request.body.read
    webhook_event = JSON.parse(data)
    msg           = webhook_event['payload']['value']['content']['text']
    # webhook_event.dig('payload', 'value', 'content', 'text')
    render json: { status: 'ok' }, status: :ok
    broadcast_notify(msg)
    TelegramService.call(User.first, msg)
    # head :ok
  rescue => e
    render json: { error: e.message }, status: :not_found
    broadcast_notify(e.message, 'danger')
    TelegramService.call(User.first, e.message)
  end

  private

  def broadcast_notify(message, key='success')
    # Rails.logger.info "Broadcasting message: #{message}"
    Turbo::StreamsChannel.broadcast_append_to(
      :notify,
      target: :notices,
      partial: '/notices/notice',
      locals: { notices: message, key: key }
    )
  end
end
