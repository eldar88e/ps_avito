class Avito::UpdatePriceJob < Avito::BaseApplicationJob
  queue_as :default

  def perform
    last_run = Run.last
    return if last_run&.status != 'finish'

    games = Game.where(price_updated: last_run.id)&.ids
    ads   = Ad.includes(:adable).active_ads.where(adable_type: 'Game', adable_id: games)
    ads.group_by(&:store_id).each do |key, ads|
      store = Store.find(key)
      puts store.manager_name
      next unless store.active

      avito = AvitoService.new(store: store)
      count = 0
      ads.each do |ad|
        item_id = ad.avito_id
        url     = "https://api.avito.ru/autoload/v2/items/ad_ids?query=#{ad.id}"
        puts "1. #{item_id}"
        item_id = fetch_and_parse(avito, url) if item_id.nil?
        puts "2. #{item_id}"
        url     = "https://api.avito.ru/core/v1/items/#{item_id}/update_price"
        price   = GamePriceService.call(ad.adable.price_tl, store)
        puts price
        # fetch_and_parse(avito, url, :post, { price: price })
        count += 1
      end
      user = store.user
      msg  = "Обновились цены у #{count} игр на аккаунте #{store.manager_name}"
      broadcast_notify(msg)
      TelegramService.call(user, msg)
    end

    nil
  rescue => e
    msg = "Error #{self.class} || #{e.message}"
    Rails.logger.error(msg)
  end
end

# Avito::UpdatePriceJob.perform_now