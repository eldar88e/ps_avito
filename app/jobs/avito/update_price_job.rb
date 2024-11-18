module Avito
  class UpdatePriceJob < Avito::BaseApplicationJob
    queue_as :default

    def perform(**args)
      last_run = Run.last
      return if last_run&.status != 'finish'

      user     = find_user(args)
      game_ids = Game.where(price_updated: last_run.id)&.ids
      ads      = Ad.includes(:adable).active_ads.where(adable_type: 'Game', adable_id: game_ids)
      ############
      game_names = Game.where(id: game_ids).pluck(:name).map.with_index(1) { |name, index| "#{index}. `#{name}`" }
      msg        = "Игры к обновлению цен:\n#{game_names.join("\n")}"
      broadcast_notify(msg)
      TelegramService.call(user, msg)
      #############
      ads.group_by(&:store_id).each do |key, group_ads|
        store = Store.find_by(id: key, active: true)
        next unless store

        avito = AvitoService.new(store:)
        count = group_ads.reduce(0) { |acc, ad| process_ad(avito, ad) ? acc + 1 : acc }
        msg   = "Обновились цены у #{count} игр на аккаунте #{store.manager_name}"
        broadcast_notify(msg)
        TelegramService.call(user, msg) if count.positive?
      end

      nil
    rescue StandardError => e
      Rails.logger.error "Error #{self.class} || #{e.message}"
      TelegramService.call(user, "Error #{self.class} || #{e.message}")
    end

    private

    def process_ad(avito, ad)
      item_id = ad.avito_id || fetch_avito_id(avito, ad)
      url     = "https://api.avito.ru/core/v1/items/#{item_id}/update_price"
      price   = GamePriceService.call(ad.adable.price_tl, store)
      result  = fetch_and_parse(avito, url, :post, { price: })
      result&.dig('result', 'success').present?
    end

    def fetch_avito_id(avito, ad)
      url     = "https://api.avito.ru/autoload/v2/items/avito_ids?query=#{ad.id}"
      item_id = fetch_and_parse(avito, url)&.dig('items')&.at(0)&.dig('avito_id')
      return unless item_id

      ad.update(avito_id: item_id)
      item_id
    end
  end
end
