require 'faraday'

class AvitoService
  def initialize(**args)
    @store = args[:store]
    raise "Not set store" if @store.nil?

    @client_id     = @store.client_id
    @client_secret = @store.client_secret
    @token_status  = nil

    if @client_id.blank? || @client_secret.blank?
      Rails.logger.error "Not set client_id & client_secret for #{@store.manager_name}"
    end

    @token   = get_token
    @headers = {
      "Authorization" => "Bearer #{@token}",
      "Content-Type" => "application/json"
    }
  end

  attr_reader :token_status

  def connect_to(url, method=:get, payload=nil)
    return if @token.blank? || @client_id.blank? || @client_secret.blank?

    request    = method == :get ? :url_encoded : :json
    connection = Faraday.new(url: url) do |faraday|
      faraday.request request
      faraday.response :logger if Rails.env.development?
      faraday.adapter Faraday.default_adapter
    end

    connection.send(method) do |req|
      req.headers = @headers
      req.body    = payload.to_json if payload
    end
  rescue => e
    Rails.logger.error e.message
    nil
  end

  private

  def get_token
    cache_key  = "store_#{@store.id}_avito_token"
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

    conn = Faraday.new(url: 'https://api.avito.ru') do |faraday|
      faraday.request :url_encoded
      faraday.adapter Faraday.default_adapter
    end

    response = conn.post('/token/') do |req|
      req.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      req.body = URI.encode_www_form({ grant_type: 'client_credentials',
                                       client_id: @client_id,
                                       client_secret: @client_secret })
    end

    if response.success?
      token_info = JSON.parse(response.body)
      @store.avito_tokens.create token_info
      token_info['access_token']
    else
      msg = "Failed to get token! Status: (#{response.status}), Account: #{@store.manager_name}, Error: #{response.body}"
      Rails.logger.error msg
      @token_status = response.status
      nil
    end
  end
end
