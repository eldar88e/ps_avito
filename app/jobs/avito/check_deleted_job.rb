# Avito::CheckDeletedJob.perform_now(store: Store.find(8))

class Avito::CheckDeletedJob < ApplicationJob
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
    report_id = args[:report_id]
    avito_url = "https://api.avito.ru/autoload/v2/reports/#{report_id ? report_id : 'last_completed_report'}"

    stores.each do |store|
      avito = AvitoService.new(store: store)
      next if avito.token_status == 403

      if report_id.nil?
        report = fetch_and_parse(avito, avito_url)
        next if report.nil?

        avito_url = "https://api.avito.ru/autoload/v2/reports/#{report['report_id']}"
      end
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
          existing_ad = find_ad(avito_id, ads_db)
          if existing_ad
            existing_ad.update(avito_id: avito_id, deleted: 1)
            deleted += 1 if existing_ad.saved_changes?
          end
        end
        page += 1
      rescue => e
        TelegramService.call(user, e.message)
      end
      TelegramService.call(user, "Success pin deleted #{deleted} ad(s) for #{store.manager_name}") if deleted.size > 0
    end

    nil
  end

  private

  def find_ad(avito_id, ads_db)
    existing_ad = ads_db.find_by(avito_id: avito_id)
    return existing_ad if existing_ad

    url      = "https://api.avito.ru/autoload/v2/items/ad_ids?query=#{avito_id}"
    response = fetch_and_parse(avito, url)
    return if response.nil?

    sleep rand(0.3..0.9)
    ad_id = response['items'][0]['ad_id'].to_i
    ads_db.find_by(id: ad_id)
  end

  def fetch_and_parse(avito, url, method = :get, payload=nil)
    response = avito.connect_to(url, method, payload)
    return if response.nil? || response.status != 200

    JSON.parse(response.body)
  end
end
