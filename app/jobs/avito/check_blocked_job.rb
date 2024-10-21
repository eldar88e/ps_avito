# Avito::CheckBlockedJob.perform_now(store: Store.find(5))
# job временный пока не удалятся с авито объявления с file ID подобные этому:
# HP6545-PPSA23226_00-GAME000000000000_2_5

class Avito::CheckBlockedJob < Avito::BaseApplicationJob
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
      avito = AvitoService.new(store: store)
      next if avito.token_status == 403

      ads_db    = store.ads.load
      page      = 1
      ads_cache = {}
      updated   = [0]
      loop do
        url = "https://api.avito.ru/core/v1/items?page=#{page}&per_page=#{PER_PAGE}&status=blocked"
        ads_cache[:"#{page}"] ||= fetch_and_parse(avito, url)
        ads = ads_cache[:"#{page}"]
        break if ads.nil? || ads["resources"].blank?

        ads["resources"].each { |i| find_ad(i['id'], ads_db, updated[0], avito) }
        page += 1
      end
      msg = "✅ Updated AvitoID for blocked #{updated[0]} ads for #{store.manager_name}"
      TelegramService.call(user, msg) if updated[0] > 0
    end

    nil
  end

  private

  def find_ad(avito_id, ads_db, updated, avito)
    return if ads_db.exists?(avito_id: avito_id)

    url      = "https://api.avito.ru/autoload/v2/items/ad_ids?query=#{avito_id}"
    response = fetch_and_parse(avito, url)
    return if response.nil?

    sleep rand(0.7..1.5)
    ad_id       = response['items'][0]['ad_id'].to_i
    existing_ad = ads_db.find_by(file_id: ad_id)
    (existing_ad.update(avito_id: avito_id) && (updated[0] += 1)) if existing_ad
  end
end
