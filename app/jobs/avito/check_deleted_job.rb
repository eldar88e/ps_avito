class Avito::CheckDeletedJob < ApplicationJob
  queue_as :default
  PER_PAGE = 90

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
      page      = 0
      ads_cache = {}
      loop do
        #######
        puts page
        binding.pry
        #########
        url = "https://api.avito.ru/core/v1/items?page=#{page}&per_page=#{PER_PAGE}&status=removed"
        ads_cache[:"#{page}"] ||= fetch_and_parse(avito, url)
        ads = ads_cache[:"#{page}"]
        break if ads.nil? || ads["resources"].blank?

        ids = ads["resources"].map { |i| i['id'] }
        ids.each do |avito_id|
          # ####
          puts avito_id
          # #####
          existing_ad = ads_db.find_by(avito_id: avito_id)
          binding.pry
          #existing_ad.update(deleted: 1)
          next if existing_ad

          url      = "https://api.avito.ru/autoload/v2/items/ad_ids?query=#{avito_id}"
          response = fetch_and_parse(avito, url)
          next if response.nil?

          ad_id       = response['items'][0]['ad_id'].to_i
          existing_ad = ads_db.find_by(id: ad_id)
          binding.pry
          #existing_ad.update(avito_id: avito_id, deleted: 1) if existing_ad
          sleep rand(0.3..0.9)
        end
        page += 1
      rescue => e
        TelegramService.call(user, e.message)
      end
      TelegramService.call(user, 'Success pin deleted ads.')
    end

    nil
  end

  private

  def fetch_and_parse(avito, url, method = :get, payload=nil)
    response = avito.connect_to(url, method, payload)
    return if response.nil? || response.status != 200

    JSON.parse(response.body)
  end
end
