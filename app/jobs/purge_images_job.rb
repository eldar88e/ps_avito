class PurgeImagesJob < ApplicationJob
  queue_as :default

  def perform(**args)
    site  = args[:site]
    games = Game.order(:top)
    games.each do |game|
      if game.images.attached? && game.images.blobs.any? { |i| i.metadata[:site] == site }
        game.images.each { |image| image.purge if image.blob.metadata[:site] == site }
      end
    end

    nil
  end
end
