class GameImageDownloaderJob < ApplicationJob
  queue_as :default

  def perform
    size     = Setting.pluck(:var, :value).to_h['game_img_size']
    sony_ids = Game.order(:top).pluck(:sony_id)
    sony_ids.each do |id|
      img_path = "./game_images/#{id}_#{size}.jpg"
      puts "Downloading #{img_path}"
      next if File.exist?(img_path)

      url = 'https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/' \
            "#{id}/0/image?w=#{size}&h=#{size}"
      img = download_image(url)
      next if img.nil?

      File.open(img_path, 'wb') { |local_file| local_file.write(img) }
      sleep rand(1..5)
    end
    TelegramService.new('✅ All game image downloaded!').report
  end

  private

  def download_image(url)
    response = Faraday.new.get(url)
    # response = connect_to(url)
    if response.status == 200 || response.headers['content-type'].match?(/image/)
      response.body
    else
      puts "Job: #{self.class} || Error message: PS-image is not available! URL: #{url}"
      Rails.logger.error "Job: #{self.class} || Error message: PS-image is not available! URL: #{url}"
      TelegramService.new("PS img is not available\n#{url}").report
      nil
    end
  rescue => e
    Rails.logger.error "Class: #{e.class} || Error message: #{e.message}"
    TelegramService.new("Sony image is not available\nError message: #{e.message}\n#{url}").report
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
