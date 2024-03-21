class AddWatermarkJob < ApplicationJob
  queue_as :default
  include Rails.application.routes.url_helpers

  def perform(**args)
    size  = args[:settings]['game_img_size']
    store = args[:store]
    games = Game.order(:top).with_attached_images
    games.each do |game|
      store.addresses.each do |address|
        if game.images.attached? && args[:clear]
          game.images.each { |i| i.purge if i.blob.metadata[:store_id] == store.id && i.blob.metadata[:address_id] == address.id }
          sleep 3
        end

        # next if game.images.attached? && game.images.blobs.any? { |i| i.metadata[:store_id] == store.id && i.metadata[:address_id] == address.id }

        w_service = WatermarkService.new(store: store, address: address, size: size, game: game)
        next unless w_service.image

        image = w_service.add_watermarks
        name  = "#{game.sony_id}_#{size}.jpg"
        save_image(image: image, game: game, name: name, store_id: store.id, address_id: address.id)
      end
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
                              metadata: { store_id: args[:store_id], address_id: args[:address_id] })
    save_game(args[:game])

    temp_img.close
    temp_img.unlink
  end

  def save_game(game)
    game.save || Rails.logger.error("Error save attach image for game id: #{game.id}")
  end
end
