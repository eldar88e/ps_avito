class Avito::CheckStatusJob < ApplicationJob
  queue_as :default

  def perform(**args)
    stores =
      if args[:store]
        [args[:store]]
      else
        return unless args[:user_id]

        current_user(args[:user_id]).stores.where(active: true)
      end
    current_user = stores.first.user

    stores.each do |store|
      avito = AvitoService.new(store: store)
      next if avito.token_status == 403

      page = 0
      loop do
        url = "https://api.avito.ru/core/v1/items?#{page}"
        ads = fetch_and_parse(avito, url)
        break if ads.nil? || ads["resources"].blank?
        ids        = ads["resources"].map { |i| i['id'] }
        prev_date  = Time.current.prev_month.to_date.to_s
        payload    = {'dateFrom': prev_date, 'itemIds': ids, 'periodGrouping': "month"}
        account_id = '' # TODO получить id account
        url        = "https://api.avito.ru/stats/v1/accounts/#{account_id}/items"
        response   = avito.connect_to(url, :post, payload)
        binding.pry
        page += 1
      end
    end

    nil
  end

  private

  def send_error_sections(section, user, account)
    TelegramService.call(user, "‼️#{section['title']} #{section['count']} на аккаунте #{account}.")
  end

  def fetch_and_parse(avito, url)
    response = avito.connect_to(url)
    return if response.nil? || response.status != 200

    JSON.parse(response.body)
  end
end
