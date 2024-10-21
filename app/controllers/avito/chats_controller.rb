class Avito::ChatsController < ApplicationController
  include AvitoConcerns
  before_action :set_account_id, only: [:index, :show]
  layout 'avito'

  def index
    url_chats = "https://api.avito.ru/messenger/v2/accounts/#{@account_id}/chats"
    response  = fetch_and_parse(url_chats)
    @chats    = response['chats']
  end

  def show
    chat_id   = params[:id].presence
    url_msg   = "https://api.avito.ru/messenger/v3/accounts/#{@account_id}/chats/#{chat_id}/messages/"
    response  = fetch_and_parse(url_msg)
    @messages = response['messages']
  end

  private

  def set_account_id
    @account_id = Rails.cache.fetch("store_#{@store.id}", expires_in: 1.hour) do
      url = 'https://api.avito.ru/core/v1/accounts/self'
      fetch_and_parse(url)['id']
    end
  end
end