class AddWatermarkJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user     = find_user(args)
    settings = args[:settings]
    model    = args[:model]
    products = (model == Game ? model.order(:top) : user.send("#{model}s".downcase.to_sym)).active.includes(ads: { image_attachment: :blob })
    stores   = make_stores(args, user)
    id       = model == Game ? :sony_id : :id

    stores.each do |store|
      count     = 0
      addresses = store.addresses.active
      addresses = addresses.where(id: args[:address_id].to_i) if args[:address_id]
      addresses.each do |address|
        products = products.limit(address.total_games) if model == Game
        products.each do |product|
          next if product.is_a?(Game) && product.game_black_list

          file_id = "#{product.send(id)}_#{store.id}_#{address.id}"
          ad      = find_or_create_ad(product, file_id, address)
          next if ad.image.attached? && !args[:clean]

          SaveImageJob.send(job_method, ad:, product:, store:, address:, id:, file_id:, user:, model:, settings:)
          count += 1
        end
      end
      address = addresses.size == 1 ? addresses.first.city : addresses.map(&:city).join("\n")
      msg     = "🏞 Added #{count} image(s) for #{model} for #{store.manager_name} for:\n#{address}"
      msg     = 'No active address!' if addresses.empty?
      broadcast_notify(msg)
      TelegramService.call(user, msg) if addresses && args[:notify]
    end
    Clean::CleanUnattachedBlobsJob.perform_later(user: user) if args[:clean]
  rescue StandardError => e
    Rails.logger.error("#{self.class} - #{e.message}")
    TelegramService.call(user, "Error #{self.class} || #{e.message}")
  end

  private

  def make_stores(args, user)
    return user.stores.includes(:addresses).active if args[:all]

    [args[:store]].compact
  end

  def find_or_create_ad(product, file_id, address)
    product.ads.active.find_or_create_by(file_id:) do |new_ad|
      store          = address.store
      new_ad.user    = store.user
      new_ad.address = address
      new_ad.store   = store
      new_ad.full_address = address.store_address
    end
  end
end
