class Avito::CheckStatusJob < ApplicationJob
  queue_as :default
  PER_PAGE = 50

  def perform(**args)
    stores =
      if args[:store]
        [args[:store]]
      else
        return unless args[:user_id]

        current_user(args[:user_id]).stores.where(active: true)
      end
    user = stores.first.user

    stores.each do |store|
      low_rating = []
      avito = AvitoService.new(store: store)
      next if avito.token_status == 403

      url      = 'https://api.avito.ru/core/v1/accounts/self'
      response = avito.connect_to(url)
      next if response.status != 200

      account_id  = JSON.parse(response.body)['id']
      ads_db      = store.ads.load
      page        = 0
      ads_cache   = {}
      items_cache = {}
      loop do
        url = "https://api.avito.ru/core/v1/items?page=#{page}&per_page=#{PER_PAGE}"
        ads_cache[:"#{page}"] ||= fetch_and_parse(avito, url)
        ads = ads_cache[:"#{page}"]
        break if ads.nil? || ads["resources"].blank?

        ids       = ads["resources"].map { |i| i['id'] }
        date_from = Time.current.beginning_of_month.to_date.to_s # TODO добавить .prev_month
        date_to   = Time.current.beginning_of_month.to_date.to_s
        payload   = { 'dateFrom': date_from, 'itemIds': ids, 'periodGrouping': 'month' } # 'dateTo': date_to,
        url       = "https://api.avito.ru/stats/v1/accounts/#{account_id}/items"
        items_cache[:"#{page}"] ||= fetch_and_parse(avito, url, :post, payload)
        items_raw = items_cache[:"#{page}"]
        items     = items_raw['result']['items']
        items.each do |item|
          next if item['stats'].present?

          avito_id = item['itemId']
          options  = { avito_id: avito_id }
          updated  = update_ad(ads_db, **options)
          next if updated

          url      = "https://api.avito.ru/autoload/v2/items/ad_ids?query=#{avito_id}"
          response = fetch_and_parse(avito, url)
          next if response.nil?

          ad_id = response['items'][0]['ad_id']
          low_rating << ad_id
          options[:id] = ad_id
          update_ad(ads_db, **options)
          sleep rand(0.7..1.5)
        end
        page += 1
      rescue => e
        TelegramService.call(user, e.message)
      end
      msg = "✅ Store #{store} have #{low_rating.size} low rating ads.\n#{low_rating.join(", ")}"
      TelegramService.call(user, msg) if low_rating.size > 0
    end

    nil
  end

  private

  def update_ad(ads_db, **args)
    avito_id = args[:id] ? args.delete(:avito_id) : nil
    #ad       = ads_db.find { |i| i[args.keys.first] == args.values.first }
    puts args # TODO убрать
    ad = ads_db.find_by(args)
    puts avito_id # TODO убрать
    if ad.present?
      options = {}
      # options[:deleted]  = 1 # TODO раскоментировать и проверить
      options[:avito_id] = avito_id if ad.avito_id.blank?
      ad.update(options)
      binding.pry
    end
  end

  def send_error_sections(section, user, account)
    TelegramService.call(user, "‼️#{section['title']} #{section['count']} на аккаунте #{account}.")
  end

  def fetch_and_parse(avito, url, method = :get, payload=nil)
    response = avito.connect_to(url, method, payload)
    return if response.nil? || response.status != 200

    JSON.parse(response.body)
  end
end
