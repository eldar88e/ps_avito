class CleanAttachBlobJob < ApplicationJob
  queue_as :default

  def perform
    games = Game.order(:top).with_attached_images
    count = 0
    games.each do |game|
      game.images.each do |image|
        key      = image.blob.key
        raw_path = key.scan(/.{2}/)[0..1].join('/')
        img_path = "./storage/#{raw_path}/#{key}"
        unless File.exist?(img_path)
          image.purge
          count += 1
        end
      end
    end
    Rails.logger.info "⚠️ Cleared #{count} rows in tables with missing images."
  end
end
