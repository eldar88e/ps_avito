class Avito::CheckBalancesJob < Avito::BaseApplicationJob
  queue_as :default

  def perform(**args)
    user   = find_user args
    stores = user.stores.active
    stores.each do |store|
      avito = AvitoService.new(store:)
      next if avito.token_status == 403

      balance_raw = fetch_and_parse(avito, 'https://api.avito.ru/cpa/v3/balanceInfo', :post, {})
      next if balance_raw.nil?

      balance = balance_raw['balance']
      result  = balance / 100
      if result < 100
        msg = result < 45 ? 'Объявления сняты с публикации.' : 'Низкий'
        TelegramService.call(user, "‼️ #{store.manager_name} — #{msg} баланс(#{result}₽, #{balance})!")
      end
    end

    nil
  end
end
