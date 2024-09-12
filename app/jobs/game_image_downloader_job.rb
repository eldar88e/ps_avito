class GameImageDownloaderJob < ApplicationJob
  queue_as :default

  def perform(**args)
    args[:user] = current_user(args[:user_id]) unless args[:user]
    size        = args.dig(:settings, 'game_img_size') || 1024
    games       = Game.order(:top) # TODO .where(deleted: 0)
    games.each do |game|
      next if game.image.attached?

      url = 'https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/' \
        "#{game.sony_id}/0/image?w=#{size}&h=#{size}"
      img = download_image(url, args[:user])
      next if img.nil?

      name = "#{game.sony_id}_#{size}.jpg"
      save_image(game, img, name)
      sleep rand(0.7..2.9)
    end
    msg = '✅ All game image downloaded!'
    broadcast_notify(msg)
    TelegramService.call(args[:user], msg)
  rescue => e
    Rails.logger.error(e.full_message)
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
    response = connect_to(url)
    return response.body if response&.headers['content-type']&.match?(/image/)

    Rails.logger.error "Job: #{self.class} || Error message: PS img is not available! URL: #{url}"
    TelegramService.call(user, "PS img is not available\n#{url}")
    nil
  rescue => e
    Rails.logger.error "Class: #{e.class} || Error message: #{e.full_message}"
    TelegramService.call(user, "PS img is not available\nError message: #{e.message}\n#{url}")
    nil
  end

  def connect_to(url)
    faraday_params = { proxy: fetch_proxy }

    connection = Faraday.new(faraday_params) do |faraday|
      faraday.request  :url_encoded
      faraday.response :logger if Rails.env.development?
      faraday.adapter :net_http
      faraday.headers['User-Agent']      = UserAgentService.call
      faraday.headers['Accept']          = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
      faraday.headers['Accept-Encoding'] = 'gzip, deflate, br, zstd'
      faraday.headers['Accept-Language'] = 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7'
    end

    connection.get(url)
  end

  def fetch_proxy
    YAML.load_file('proxies.yml').sample
  end
end
