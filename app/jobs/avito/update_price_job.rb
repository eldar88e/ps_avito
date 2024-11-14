class Avito::UpdatePriceJob < Avito::BaseApplicationJob
  queue_as :default

  def perform(**args)
    last_run = Run.last
    return if last_run&.status == 'finish'

    games = Game.where(price_updated: last_run.id)&.ids
    ads   = Ad.includes(:adable).where(adable_type: 'Game', adable_id: games)
    ads.group_by(&:store_id).each do |key, ads|
      store = Store.find(key)
      avito = AvitoService.new(store: store)
      count = 0
      ads.each do |ad|
        item_id = ad.avito_id
        url     = "https://api.avito.ru/autoload/v2/items/#{ad.id}"
        item_id = fetch_and_parse(avito, url) if item_id.nil?
        url     = "https://api.avito.ru/core/v1/items/#{item_id}/update_price"
        price   = GamePriceService.call(ad.adable.price_tl, store)
        puts item_id
        puts price
        # fetch_and_parse(avito, url, :post, { price: price })
        count += 1
      end
      user = store.user
      msg  = "Обновились цены у #{count} игр на аккаунте #{store.manager_name}"
      broadcast_notify(msg)
      TelegramService.call(user, msg)
    end
  end
end
