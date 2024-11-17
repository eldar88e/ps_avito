require 'faraday'

class AvitoService
  AVITO_TOKEN_URL = 'https://api.avito.ru/token'

  def initialize(**args)
    @store = args[:store]
    raise 'Not set store' if @store.nil?

    @client_id     = @store.client_id
    @client_secret = @store.client_secret
    @token_status  = nil

    if @client_id.blank? || @client_secret.blank?
      Rails.logger.error "Not set client_id & client_secret for #{@store.manager_name}"
    end

    @token   = get_token
    @headers = {
      'Authorization' => "Bearer #{@token}",
      'Content-Type' => 'application/json'
    }
  end

  attr_reader :token_status

  def connect_to(url, method = :get, payload = nil, **args)
    return if (@token.blank? || @client_id.blank? || @client_secret.blank?) && args[:headers].blank?

    request    = method == :get || args[:url_encoded] ? :url_encoded : :json
    connection = Faraday.new(url:) do |faraday|
      faraday.request request
      faraday.response :logger if Rails.env.development?
      faraday.adapter Faraday.default_adapter
    end

    connection.send(method) do |req|
      req.headers = args[:headers] || @headers
      req.body    = args[:form] ? payload : payload.to_json if payload
    end
  rescue StandardError => e
    Rails.logger.error e.message
    nil
  end

  private

  def get_token
    cache_key = "store_#{@store.id}_avito_token"
    Rails.cache.fetch(cache_key, expires_in: 10.minutes) do
      last_token = @store.avito_tokens.order(created_at: :desc).first
      valid_token?(last_token) ? last_token.access_token : refresh_token
    end
  end

  def valid_token?(model)
    model&.created_at.to_i + model&.expires_in.to_i - 10.minutes > Time.current.to_i
  end

  def refresh_token
    return if @client_id.blank? || @client_secret.blank?

    payload = URI.encode_www_form({ grant_type: 'client_credentials',
                                    client_id: @client_id,
                                    client_secret: @client_secret })
    headers  = { 'Content-Type' => 'application/x-www-form-urlencoded' }
    params   = { headers:, form: true, url_encoded: true }
    response = connect_to(AVITO_TOKEN_URL, :post, payload, **params)
    return log_bad_token(response) unless response.success?

    parse_token(response)
  end

  def parse_token(response)
    token_info = JSON.parse(response.body)
    @store.avito_tokens.create token_info
    token_info['access_token']
  end

  def log_bad_token(response)
    msg = "Failed to get token! Status: (#{response.status}), Account: #{@store.manager_name}, Error: #{response.body}"
    Rails.logger.error msg
    @token_status = response.status
    nil
  end
end
