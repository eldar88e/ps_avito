class AddWatermarkJob < ApplicationJob
  queue_as :default
  include Rails.application.routes.url_helpers

  def perform(**args)
    args[:user] = current_user(args[:user_id]) unless args[:user]
    lock_key    = "#{args[:user].id}_#{self.class}_#{args[:address_id]}"
    begin # GoodJob::AdvisoryLock.with_advisory_lock(lock_key) do |locked|
      if true # locked
        settings  = args[:settings]
        font      = args[:main_font]
        model     = args[:model]
        products  = (model == Game ? model.order(:top) : args[:user].send("#{model}s".downcase.to_sym).where(active: true))
        addr_args = {}
        stores    =
          if args[:all]
            args[:user].stores.includes(:addresses).where(active: true, addresses: { active: true })
          else
            addr_args[:active] = true
            [args[:store]]
          end
        id             = model == Game ? :sony_id : :id
        addresses      = nil
        count          = 0
        addr_args[:id] = args[:address_id].to_i if args[:address_id]

        stores.each do |store|
          addresses = store.addresses.where(addr_args)
          addresses.each do |address|
            products = products.limit(address.total_games) if model == Game && address.total_games.present?
            products.each do |product|
              next if product.is_a?(Game) && product.game_black_list

              file_id     = "#{product.send(id)}_#{address.store.id}_#{address.id}"
              current_img = address.ads.find_by(file_id: file_id, deleted: 0)
              (args[:clean] ? current_img.image.purge : next) if current_img&.image&.attached?

              w_service = WatermarkService.new(store: store, address: address, settings: settings,
                                               game: product, main_font: font, product: model == Product)
              next unless w_service.image

              image = w_service.add_watermarks
              name  = "#{product.send(id)}_#{store.id}_#{address.id}_#{settings[:game_img_size]}.jpg"
              save_image(image: image, product: product, name: name, address: address)
              count += 1
            end
          end
        end

        if addresses && args[:notify]
          address = addresses.size == 1 ? addresses.first.city : addresses.map { |i| i.city }.join("\n")
          address = 'No active address!' if addresses.size.zero?
          msg     = "🏞 Added #{count} image(s) for #{model} for #{stores.first.manager_name} for:\n#{address}"
          broadcast_notify(msg)
          TelegramService.call(args[:user], msg)
        else
          broadcast_notify('Success!', 'primary')
        end
      else
        msg = "The job was run! You are trying to run the running job."
        broadcast_notify(msg)
        TelegramService.call(args[:user], msg)
      end
    end
  rescue => e
    TelegramService.call(args[:user], "Error #{self.class} || #{e.message}")
    Rails.logger.error("#{self.class} - #{e.message}")
  end

  private

  def save_image(**args)
    file_id = args[:name].sub(/_\d+\.jpg\z/, '')
    item    = args[:address].ads.find_by(file_id: file_id, deleted: 0)
    return if item&.image&.attached?

    Tempfile.open(%w[image .jpg]) do |temp_img|
      args[:image].write(temp_img.path)
      temp_img.flush

      ad = args[:address].ads.find_or_create_by(
        user: args[:address].store.user,
        adable: args[:product],
        store: args[:address].store,
        file_id: file_id,
        deleted: 0
      )

      ad.image.attach(
        io: File.open(temp_img.path),
        filename: args[:name],
        content_type: 'image/jpeg'
      )
    end
  end
end
