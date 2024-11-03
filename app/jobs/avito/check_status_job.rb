# Job для поиска объявлений с низким рейтингом и если надо то помечать deleted

class Avito::CheckStatusJob < Avito::BaseApplicationJob
  queue_as :default
  PER_PAGE = 100

  def perform(**args)
    user = nil
    stores =
      if args[:store]
        [args[:store]]
      else
        return unless args[:user_id]

        user = find_user(args)
        user.stores.active
      end
    user ||= stores.first.user

    stores.each do |store|
      low_rating  = []
      without_ads = []
      deleted     = []
      avito = AvitoService.new(store: store)
      next if avito.token_status == 403

      url      = 'https://api.avito.ru/core/v1/accounts/self'
      response = avito.connect_to(url)
      next if response.status != 200

      account_id  = JSON.parse(response.body)['id']
      ads_db      = store.ads.load
      page        = 1
      ads_cache   = {}
      items_cache = {}
      loop do
        url = "https://api.avito.ru/core/v1/items?page=#{page}&per_page=#{PER_PAGE}"
        ads_cache[:"#{page}"] ||= fetch_and_parse(avito, url)
        ads = ads_cache[:"#{page}"]
        break if ads.nil? || ads["resources"].blank?

        ids       = ads["resources"].map { |i| i['id'] }
        date_from = Time.current.beginning_of_month.to_date.to_s
        date_to   = Time.current.beginning_of_month.to_date.to_s
        payload   = { 'dateFrom': date_from, 'itemIds': ids, 'periodGrouping': 'month' } # 'dateTo': date_to,
        url       = "https://api.avito.ru/stats/v1/accounts/#{account_id}/items"
        items_cache[:"#{page}"] ||= fetch_and_parse(avito, url, :post, payload)
        items_raw = items_cache[:"#{page}"]
        items_raw['result']['items'].each do |item|
          next if item['stats'].present?

          avito_id = item['itemId']
          options  = { avito_id: avito_id }
          updated  = update_ad(deleted, ads_db, **options)
          next if updated

          url      = "https://api.avito.ru/autoload/v2/items/ad_ids?query=#{avito_id}"
          response = fetch_and_parse(avito, url)
          next if response.nil?

          ad_id = response['items'][0]['ad_id'].to_i
          without_ads << avito_id if ad_id.zero?
          low_rating << ad_id if !ad_id.zero?
          options[:id] = ad_id
          update_ad(deleted, ads_db, **options)
          sleep rand(0.7..1.5)
        end
        page += 1
      rescue => e
        TelegramService.call(user, e.message)
      end
      msg = "✅ Store #{store.manager_name} have:\n"
      msg << "📌 #{low_rating.size} low rating ads.\n#{low_rating.join(', ')}.\n" if low_rating.size > 0
      msg << "📌 #{without_ads.size} items without ads.\n#{without_ads.join(', ')}." if without_ads.size > 0
      msg << "📌 #{deleted.size} deleted ads.\n#{deleted.join(', ')}.\n" if deleted.size > 0
      TelegramService.call(user, msg) if low_rating.size > 0 || without_ads.size > 0 || deleted.size > 0
    end

    nil
  end

  private

  def update_ad(deleted, ads_db, **args)
    avito_id = args[:id] ? args.delete(:avito_id) : nil
    ad       = ads_db.find_by(args)
    return unless ad.present?

    options = {}
    if ad.created_at < Time.current.prev_month
      # options[:deleted] = 1 # TODO Если нужно удалять нужно раскомментировать
      deleted << ad.id
    end
    options[:avito_id] = avito_id if ad.avito_id.blank?
    ad.update(options)
  end
end
