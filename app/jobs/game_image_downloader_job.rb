class GameImageDownloaderJob < ApplicationJob
  queue_as :default

  def perform
    size     = Setting.pluck(:var, :value).to_h['game_img_size']
    sony_ids = Game.order(:top).pluck(:sony_id)
    sony_ids.each do |id|
      img_path = "./game_images/#{id}_#{size}.jpg"
      next if File.exist?(img_path)

      url = 'https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/' \
            "#{id}/0/image?w=#{size}&h=#{size}"
      img = download_image(url)
      next if img.nil?

      File.open(img_path, 'wb') { |local_file| local_file.write(img) }
      sleep rand(1..2)
    end
    TelegramService.new('✅ All game image downloaded!').report
  end

  private

  def download_image(url)
    response = Faraday.new.get(url)
    if response.status == 200 || response.headers['content-type'].match?(/image/)
      response.body
    else
      Rails.logger.error "Class: #{self.class} || Error message: Sony image is not available! URL: #{url}"
      #TelegramService.new("Sony image is not available\n#{url}").report
      nil
    end
  rescue => e
    Rails.logger.error "Class: #{e.class} || Error message: #{e.message}"
    TelegramService.new("Sony image is not available\nError message: #{e.message}\n#{url}").report
    nil
  end
end
