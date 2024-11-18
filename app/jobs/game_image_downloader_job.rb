class GameImageDownloaderJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user  = find_user args
    size  = args.dig(:settings, 'game_img_size')
    games = Game.order(:top).active
    games.each do |game|
      next if game.image.attached?

      url = 'https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/' \
            "#{game.sony_id}/0/image?w=#{size}&h=#{size}"
      img = download_image(url, user)
      next if img.nil?

      name = "#{game.sony_id}_#{size}.jpg"
      save_image(game, img, name)
      sleep rand(0.7..2.9)
    end
    msg = '✅ All game image downloaded!'
    broadcast_notify(msg)
    TelegramService.call(user, msg)
  rescue StandardError => e
    Rails.logger.error(e.full_message)
    TelegramService.call(user, "Error #{self.class} \n#{e.full_message}")
  end

  private

  def save_image(game, img, name)
    Tempfile.open(%w[image .jpg], binmode: true) do |temp_file|
      temp_file.write(img)
      temp_file.flush

      game.image.attach(io: File.open(temp_file.path), filename: name, content_type: 'image/jpeg')
    end
  end

  def download_image(url, user)
    response = connect_to_ps(url, user)
    return response.body if response&.headers&.[]('content-type')&.include?('image')

    msg = "Job: #{self.class} \nError message: PS img is not available! \nURL: #{url}"
    Rails.logger.error msg
    TelegramService.call(user, msg)
  rescue StandardError => e
    msg.sub!('PS img is not available!', e.full_message)
    Rails.logger.error msg
    TelegramService.call(user, msg)
  end

  def connect_to_ps(url, user)
    proxy_url      = nil # if need use with proxy change nil to fetch_proxy
    faraday_params = { proxy: proxy_url }
    begin
      connection = Faraday.new(faraday_params) do |faraday|
        faraday.request :url_encoded
        faraday.response :logger if Rails.env.development?
        faraday.adapter :net_http
        faraday.headers['User-Agent']      = UserAgentService.call
        faraday.headers['Accept']          =
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
        faraday.headers['Accept-Encoding'] = 'gzip, deflate, br, zstd'
        faraday.headers['Accept-Language'] = 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7'
      end

      connection.get(url)
    rescue Faraday::ConnectionFailed => e
      Rails.logger.error "#{e.full_message}\n#{proxy_url}"
      TelegramService.call(user, "#{e.message}\n#{proxy_url}")
      faraday_params = { proxy: nil }
      retry
    end
  end

  def fetch_proxy
    YAML.load_file('proxies.yml').sample
  end
end
