class Avito::ChatsController < ApplicationController
  include AvitoConcerns
  before_action :set_account, only: [:index, :show, :create]
  before_action :set_stores, :set_store_breadcrumbs, only: [:index, :show]
  layout 'avito'
  LIMIT = 30

  def index
    @page     = params[:page].to_i
    offset    = @page * LIMIT
    url_chats = "https://api.avito.ru/messenger/v2/accounts/#{@account['id']}/chats?limit=#{LIMIT}&offset=#{offset}"
    response  = fetch_and_parse(url_chats)
    return error_notice(response[:error]) if response[:error]

    @chats = response['chats']
    set_cache_end_page
  end

  def show
    @chat_id = params[:id].presence
    url_msg  = "https://api.avito.ru/messenger/v3/accounts/#{@account['id']}/chats/#{@chat_id}/messages/"
    response = fetch_and_parse(url_msg)
    return error_notice(response[:error]) if response[:error]

    @messages = response['messages']&.reverse || []
    render turbo_stream: turbo_stream.replace(:chats, partial: 'avito/chats/messages')

    # TODO post request for read chat
    # url = "https://api.avito.ru/messenger/v1/accounts/#{@account['id']}/chats/#{@chat_id}/read"
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

  def set_cache_end_page
    cache_key    = "chat_#{@store.id}_end_page"
    current_page = @chats.size == LIMIT ? @page + 1 : @page
    @end_page    = Rails.cache.fetch(cache_key, expires_in: 24.hour) { current_page }

    if @end_page < current_page && @chats.size == LIMIT
      Rails.cache.write(cache_key, current_page, expires_in: 24.hour)
      @end_page = current_page
    end
  end
end
