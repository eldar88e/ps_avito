class PurgeImagesJob < ApplicationJob
  queue_as :default

  def perform(**args)
    games = Game.order(:top).with_attached_images
    games.each do |game|
      if game.images.attached? && (args[:all] || game.images.blobs.any? { |i| i.metadata[:store_id] == args[:store_id] && i.metadata[:address_id] == args[:address_id] })
        game.images.each { |image| image.purge if args[:all] || (image.blob.metadata[:store_id] == args[:store_id] && image.blob.metadata[:address_id] == args[:address_id]) }
      end
    end

    nil
  end
end
