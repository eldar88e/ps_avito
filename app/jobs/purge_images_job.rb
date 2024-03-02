class PurgeImagesJob < ApplicationJob
  queue_as :default

  def perform(**args)
    games = Game.order(:top)
    games.each do |game|
      if game.images.attached? && (args[:all] || game.images.blobs.any? { |i| i.metadata[:site] == args[:site] })
        game.images.each { |image| image.purge if args[:all] || image.blob.metadata[:site] == args[:site] }
      end
    end

    nil
  end
end
