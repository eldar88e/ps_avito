class Avito::UpdatePriceJob < Avito::BaseApplicationJob
  queue_as :default

  def perform
    last_run = Run.last
    return if last_run&.status != 'finish'

    game_ids = Game.where(price_updated: last_run.id)&.ids
    ads      = Ad.includes(:adable).active_ads.where(adable_type: 'Game', adable_id: game_ids)
    ############
    msg = "Игры к обновлению цен:\n" + Game.where(id: game_ids).pluck(:name).join(",\n")
    broadcast_notify(msg)
    TelegramService.call(User.first, msg)
    #############
    ads.group_by(&:store_id).each do |key, ads|
      store = Store.find_by(id: key, active: true)
      next unless store

      avito = AvitoService.new(store: store)
      count = 0
      ads.each do |ad|
        item_id = ad.avito_id
        if item_id.nil?
          url     = "https://api.avito.ru/autoload/v2/items/avito_ids?query=#{ad.id}"
          item_id = fetch_and_parse(avito, url)&.dig('items')&.at(0)&.dig('avito_id')
          next unless item_id

          ad.update(avito_id: item_id)
        end
        url    = "https://api.avito.ru/core/v1/items/#{item_id}/update_price"
        price  = GamePriceService.call(ad.adable.price_tl, store)
        result = fetch_and_parse(avito, url, :post, { price: price })
        count += 1 if result&.dig('result', 'success')
      end
      user = store.user
      msg  = "Обновились цены у #{count} игр на аккаунте #{store.manager_name}"
      broadcast_notify(msg)
      TelegramService.call(user, msg) if count > 0
    end

    nil
  rescue => e
    Rails.logger.error "Error #{self.class} || #{e.message}"
  end
end

# Avito::UpdatePriceJob.perform_now