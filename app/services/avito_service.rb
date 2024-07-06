class AvitoService
  def initialize(**args)
    @store = args[:store]
    raise "Not set store" if @store.nil?

    @client_id     = @store.client_id
    @client_secret = @store.client_secret
    @token         = get_token
    @headers       = {
      "Authorization" => "Bearer #{@token}",
      "Content-Type" => "application/json"
    }
  end

  def connect_to(url, method=:get, payload=nil)
    request    = method == :get ? :url_encoded : :json
    connection = Faraday.new(url: url) do |faraday|
      faraday.request request
      faraday.response :logger if Rails.env.development?
      faraday.adapter Faraday.default_adapter
    end

    connection.send(method) do |req|
      req.headers = @headers
      req.body = payload.to_json if payload
    end
  rescue => e
    Rails.logger.error e.message
    nil
  end

  private

  def get_token
    last_token = @store.avito_tokens.order(created_at: :desc).first
    valid_token?(last_token) ? last_token.access_token : refresh_token
  end

  def valid_token?(model)
    model&.created_at.to_i + model&.expires_in.to_i > Time.current.to_i
  end

  def refresh_token
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
      msg = "Failed to get access token: #{response.body}"
      TelegramService.new(msg).report
    end
  end
end
