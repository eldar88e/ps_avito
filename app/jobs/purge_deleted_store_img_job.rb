class PurgeDeletedStoreImgJob < ApplicationJob
  queue_as :default

  def perform
    games    = Game.order(:top).with_attached_images
    products = Product.with_attached_images
    stores   = Store.includes(:addresses)
    [games, products].each do |model|
      model.each do |item|
        item.images.each do |image|
          image.purge && next unless stores.pluck(:id).include?(image.blob.metadata[:store_id])

          store = stores.find(image.blob.metadata[:store_id])
          image.purge unless store.addresses.pluck(:id).include?(image.blob.metadata[:address_id])
        end
      end
    end

    TelegramService.new("⚠️ All images of deleted stores and addresses have been removed!").report
  end
end
