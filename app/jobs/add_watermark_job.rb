class AddWatermarkJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user      = find_user(args)
    settings  = args[:settings]
    font      = args[:main_font]
    model     = args[:model]
    products  = (model == Game ? model.order(:top) : user.send("#{model}s".downcase.to_sym)).active
    addr_args = {}
    stores    =
      if args[:all]
        user.stores.includes(:addresses).where(active: true, addresses: { active: true })
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
        ads      = address.ads.active
        products = products.limit(address&.total_games) if model == Game
        products.each do |product|
          next if product.is_a?(Game) && product.game_black_list

          file_id = "#{product.send(id)}_#{store.id}_#{address.id}"
          ad      = find_or_create_ad(ads, product, store, file_id, user)
          next if ad.image.attached? && !args[:clean]

          SaveImageJob.send(job_method, ad: ad, product: product, store: store, address: address, font: font,
                            id: id, file_id: file_id, user: user, model: model, settings: settings)
          count += 1
        end
      end
    end

    if addresses && args[:notify]
      address = addresses.size == 1 ? addresses.first.city : addresses.map { |i| i.city }.join("\n")
      address = 'No active address!' if addresses.size.zero?
      msg     = "🏞 Added #{count} image(s) for #{model} for #{stores.first.manager_name} for:\n#{address}"
      broadcast_notify(msg)
      TelegramService.call(user, msg)
    else
      broadcast_notify('All pictures successfully prepared!', 'primary')
    end
  rescue => e
    Rails.logger.error("#{self.class} - #{e.message}")
    TelegramService.call(user, "Error #{self.class} || #{e.message}")
  end

  private

  def find_or_create_ad(ads, product, store, file_id, user)
    ads.find_or_create_by(file_id: file_id) do |new_ad|
      new_ad.user   = user
      new_ad.adable = product
      new_ad.store  = store
    end
  end
end
