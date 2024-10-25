# Avito::CheckDeletedJob.perform_now(store: Store.find(8))

class Avito::CheckDeletedJob < Avito::BaseApplicationJob
  queue_as :default
  PER_PAGE = 100

  def perform(**args)
    user   = find_user(args)
    stores = [args[:store]] || user&.stores
    stores.each do |store|
      avito = AvitoService.new(store: store)
      next if avito.token_status == 403

      report = fetch_and_parse(avito, avito_url)
      next if report.nil?

      avito_url = "https://api.avito.ru/autoload/v2/reports/#{report['report_id']}"

      ads_db    = store.ads.load
      page      = 0
      deleted   = 0
      ads_cache = {}
      loop do
        url = "#{avito_url}/items?page=#{page}&per_page=#{PER_PAGE}&sections=error_deleted"
        ads_cache[:"#{page}"] ||= fetch_and_parse(avito, url)
        ads = ads_cache[:"#{page}"]
        break if ads.nil? || ads['items'].blank?

        ads['items'].each do |item|
          avito_id    = item['avito_id']
          existing_ad = find_ad(avito_id, ads_db, avito)
          if existing_ad
            existing_ad.update(avito_id: avito_id, deleted: 1)
            deleted += 1 if existing_ad.saved_changes?
          end
        end
        page += 1
      rescue => e
        TelegramService.call(user, e.message)
      end
      TelegramService.call(user, "Success pin deleted #{deleted} ad(s) for #{store.manager_name}") if deleted > 0
    end

    nil
  end

  private

  def find_ad(avito_id, ads_db, avito)
    existing_ad = ads_db.find_by(avito_id: avito_id)
    return existing_ad if existing_ad

    url      = "https://api.avito.ru/autoload/v2/items/ad_ids?query=#{avito_id}"
    response = fetch_and_parse(avito, url)
    return if response.nil?

    sleep rand(0.3..0.9)
    ad_id = response['items'][0]['ad_id'].to_i
    ads_db.find_by(id: ad_id)
  end
end
