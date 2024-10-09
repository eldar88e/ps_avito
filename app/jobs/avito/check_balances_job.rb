class Avito::CheckBalancesJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user   = find_user args
    stores = user.stores.active
    stores.each do |store|
      avito = AvitoService.new(store: store)
      next if avito.token_status == 403

      response = avito.connect_to('https://api.avito.ru/cpa/v2/balanceInfo', :post, {})
      next if response&.status != 200

      balance = JSON.parse(response.body)['result']['balance']
      size    = balance.to_s.size < 5 ? 100 : 1000
      result  = balance / size
      TelegramService.call(user, "‼️ #{store.manager_name} — Низкий баланс(#{result}₽, #{balance})!") if result < 70
    end

    nil
  end
end
