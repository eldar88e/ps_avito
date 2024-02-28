class GameImageDownloaderJob < ApplicationJob
  queue_as :default

  def perform(*args)
    size  = Setting.all.pluck(:var, :value).to_h['game_img_size']
    games = Game.order(:top)
    games.each do |game|
      sony_id  = game.sony_id
      img_name = "#{sony_id}_#{size}"
      img_path = "./game_images/#{img_name}.jpg"
      next if File.exist?(img_path)

      url = "https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/#{sony_id}/0/image?w=#{size}&h=#{size}"
      img = download_image(url)
      next if img.nil?

      File.open(img_path, 'wb') { |local_file| local_file.write(img) }
      sleep rand(1..3)
    end
  end

  private

  def download_image(url)
    response = Faraday.new.get(url)
    if response.status == 200 || response.headers['content-type'].match?(/image/)
      response.body
    else
      Rails.logger.error "Class: #{self.class} || Error message: Sony image is not available! URL: #{url}}"
      TelegramService.new("Sony image is not available\n#{url}").report
      nil
    end
  rescue => e
    Rails.logger.error "Class: #{e.class} || Error message: #{e.message}"
    TelegramService.new("Sony image is not available\nError message: #{e.message}\n#{url}").report
    nil
  end
end
