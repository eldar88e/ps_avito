class AddWatermarkJob < ApplicationJob
  queue_as :default
  include Rails.application.routes.url_helpers

  def perform(**args)
    size     = args[:size]
    font     = args[:main_font]
    model    = args[:model]
    products = (model == Game ? model.order(:top) : args[:user].send("#{model}s".downcase.to_sym).where(active: true)).with_attached_images
    stores   = args[:all] ? args[:user].stores.includes(:addresses).where(active: true, addresses: { active: true }) : [args[:store]]
    id       = model == Game ? :sony_id : :id

    addresses = nil
    count = 0
    products.each do |product|
      stores.each do |store|
        addresses = store.addresses.where(active: true)
        addresses = addresses.select { |i| i.id == args[:address_id].to_i } if args[:address_id]
        addresses.each do |address|
          if product.images.attached?
            if args[:clean]
              product.images.each { |i| i.purge if i.blob.metadata[:store_id] == store.id && i.blob.metadata[:address_id] == address.id }
            else
              next if product.images.blobs.any? { |i| i.metadata[:store_id] == store.id && i.metadata[:address_id] == address.id }
            end
          end

          w_service = WatermarkService.new(store: store, address: address, size: size,
                                           game: product, main_font: font, product: model == Product)
          next unless w_service.image

          image = w_service.add_watermarks
          name  = "#{product.send(id)}_#{store.id}_#{address.id}_#{size}.jpg"
          save_image(image: image, product: product, name: name, store_id: store.id, address_id: address.id)
          count += 1
        end
      end
    end

    if addresses && args[:notify]
      address = addresses.size == 1 ? addresses.first.city : addresses.map { |i| i.city }.join("\n")
      address = 'No active address!' if addresses.size.zero?
      msg = "🏞 Added #{count} image(s) for #{model} for #{stores.first.manager_name} for:\n#{address}"
      broadcast_notify(msg)
      TelegramService.call(args[:user], msg)
    end
  rescue => e
    TelegramService.call(args[:user], "Error #{self.class} || #{e.message}")
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
