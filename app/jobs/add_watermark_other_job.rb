class AddWatermarkOtherJob < ApplicationJob
  queue_as :default
  include Rails.application.routes.url_helpers

  def perform(**args)
    size      = args[:size]
    main_font = args[:main_font]
    products  = Product.with_attached_images
    address   = args[:address]
    store     = address.store
    products.each do |product|
      if product.images.attached?
        if args[:clean]
          product.images.each { |i| i.purge if i.blob.metadata[:store_id] == store.id && i.blob.metadata[:address_id] == address.id }
        else
          next if product.images.blobs.any? { |i| i.metadata[:store_id] == store.id && i.metadata[:address_id] == address.id }
        end
      end

      w_service = WatermarkService.new(store: store, address: address, size: size, game: product, main_font: main_font, product: true)
      next unless w_service.image

      image = w_service.add_watermarks
      name  = "#{store.id}_#{product.id}_#{size}.jpg"
      save_image(image: image, product: product, name: name, store_id: store.id, address_id: address.id)
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

    args[:product].images.attach(io: File.open(temp_img.path), filename: args[:name], content_type: 'image/jpeg',
                              metadata: { store_id: args[:store_id], address_id: args[:address_id] })
    save_product(args[:product])

    temp_img.close
    temp_img.unlink
  end

  def save_product(product)
    product.save || Rails.logger.error("Error save attach image for game id: #{product.id}")
  end
end
