class Avito::ChatsController < ApplicationController
  include AvitoConcerns
  before_action :set_account, only: [:index, :show, :create]
  before_action :set_stores, only: [:index, :show]
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
    # TODO post request for read chat
    # url ="https://api.avito.ru/messenger/v1/accounts/#{@account['id']}/chats/#{@chat_id}/read"
    # fetch_and_parse(url, :post)
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

  def set_stores
    cache_key = "user_#{current_user.id}_active_stores"
    @stores   = Rails.cache.fetch(cache_key, expires_in: 1.hour) do
      Rails.logger.debug("Cache miss for key: #{cache_key}")
      current_user.stores.active.select(:id, :manager_name).as_json
    end
  end
end
