class PurgeImagesJob < ApplicationJob
  queue_as :default

  def perform(**args)
    games    = Game.order(:top).with_attached_images
    products = Product.with_attached_images
    [games, products].each do |model|
      model.each do |item|
        if item.images.attached? && (args[:all] || item.images.blobs.any? { |i| i.metadata[:store_id] == args[:store_id] && i.metadata[:address_id] == args[:address_id] })
          item.images.each { |image| image.purge if args[:all] || (image.blob.metadata[:store_id] == args[:store_id] && image.blob.metadata[:address_id] == args[:address_id]) }
        end
      end
    end

    nil
  end
end
