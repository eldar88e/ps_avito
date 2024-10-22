class Avito::ChatsController < ApplicationController
  include AvitoConcerns
  before_action :set_account, only: [:index, :show, :create]
  layout 'avito'

  def index
    url_chats = "https://api.avito.ru/messenger/v2/accounts/#{@account['id']}/chats?limit=30"
    response  = fetch_and_parse(url_chats)
    @chats    = response['chats']
  end

  def show
    @chat_id  = params[:id].presence
    url_msg   = "https://api.avito.ru/messenger/v3/accounts/#{@account['id']}/chats/#{@chat_id}/messages/"
    response  = fetch_and_parse(url_msg)
    @messages = response['messages']&.reverse || []
    # TODO post request for read chat 'https://api.avito.ru/messenger/v1/accounts/{user_id}/chats/{chat_id}/read'
  end

  def create
    chat_id = params[:chat_id]
    url     = "https://api.avito.ru/messenger/v1/accounts/#{@account['id']}/chats/#{chat_id}/messages"
    msg     = params[:msg]
    payload = { message: { text: msg }, type: 'text' }
    fetch_and_parse(url, :post, payload)
  end

  private

  def set_account
    @account = Rails.cache.fetch("account_#{@store.id}", expires_in: 6.hour) do
      url = 'https://api.avito.ru/core/v1/accounts/self'
      fetch_and_parse(url)
    end
  end
end
