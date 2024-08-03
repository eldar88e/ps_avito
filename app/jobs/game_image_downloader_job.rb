class GameImageDownloaderJob < ApplicationJob
  queue_as :default

  def perform(**args)
    args[:user] = current_user(args[:user_id]) unless args[:user]
    size        = args.dig(:settings, 'game_img_size') || 1024
    sony_ids    = Game.order(:top).pluck(:sony_id)
    sony_ids.each do |id|
      img_path = "./game_images/#{id}_#{size}.jpg"
      next if File.exist?(img_path)

      url = 'https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/' \
            "#{id}/0/image?w=#{size}&h=#{size}"
      img = download_image(url)
      next if img.nil?

      File.open(img_path, 'wb') { |local_file| local_file.write(img) }
      sleep rand(1..3)
    end
    msg = '✅ All game image downloaded!'
    broadcast_notify(msg)
    TelegramService.call(args[:user], msg)
  rescue => e
    puts '+' * 130
    puts e.full_message
    puts '+' * 130
    Rails.logger.error(e.full_message)
  end

  private

  def download_image(url)
    # response = Faraday.new.get(url)
    response = connect_to(url)
    if response.status == 200 || response.headers['content-type'].match?(/image/)
      response.body
    else
      Rails.logger.error "Job: #{self.class} || Error message: PS-image is not available! URL: #{url}"
      TelegramService.call(args[:user], "PS img is not available\n#{url}")
      nil
    end
  rescue => e
    Rails.logger.error "Class: #{e.class} || Error message: #{e.message}"
    TelegramService.call(args[:user], "Sony image is not available\nError message: #{e.message}\n#{url}")
    nil
  end

  def connect_to(url)
    connection = Faraday.new do |faraday|
      faraday.request  :url_encoded
      faraday.response :logger if Rails.env.development?
      faraday.adapter :net_http
      faraday.headers['User-Agent']      = UserAgentService.new.any
      faraday.headers['Accept']          = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
      faraday.headers['Accept-Encoding'] = 'gzip, deflate, br, zstd'
      faraday.headers['Accept-Language'] = 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7'
    end

    connection.get(url)
  end
end
