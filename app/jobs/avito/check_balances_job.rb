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
      if result < 100
        msg = result < 30 ? 'Объявления сняты с публикации.' : 'Низкий'
        TelegramService.call(user, "‼️ #{store.manager_name} — #{msg} баланс(#{result}₽, #{balance})!")
      end
    end

    nil
  end
end
