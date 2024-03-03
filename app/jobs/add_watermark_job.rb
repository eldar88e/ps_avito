class AddWatermarkJob < ApplicationJob
  queue_as :default

  def perform(**args)
    size  = Setting.pluck(:var, :value).to_h['game_img_size']
    site  = args[:site]
    games = Game.order(:top).with_attached_images
    games.each do |game|
      next if game.images.attached? && game.images.blobs.any? { |i| i.metadata[:site] == site }

      w_service = WatermarkService.new(site: site, size: size, game: game)
      next unless w_service.image

      image = w_service.add_watermarks
      name  = "#{game.sony_id}_#{size}.jpg"
      args  = { image: image, game: game, name: name, site: site }
      save_image(**args)
    end
    nil
  rescue => e
    TelegramService.new("Error #{self.class} || #{e.message}").report
    raise
  end

  private

  def save_image(**args)
    temp_img = Tempfile.new(%w[image .jpg])
    args[:image].write(temp_img.path)
    temp_img.flush

    args[:game].images.attach(io: File.open(temp_img.path), filename: args[:name], content_type: 'image/jpeg',
                              metadata: {site: args[:site]})
    save_game(args[:game])

    temp_img.close
    temp_img.unlink
  end

  def save_game(game)
    if game.save
      # success!
    else
      Rails.logger.error "Error save attach image for game id: #{game.id}"
    end
  end
end
