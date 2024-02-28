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

      in_img_url = "https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/#{sony_id}/0/image?w=#{size}&h=#{size}"
      img        = URI.open(in_img_url)
      File.open(img_path, 'wb') { |local_file| local_file.write(img.read) }
      sleep rand(1..3)

      ###
      puts "Saved!"
    end
  end
end
