class UpdateBanListJob < ApplicationJob
  queue_as :default

  def perform(**args)
    ####
    args[:user_id] = 1 # TODO убрать
    ######

    current_user = current_user(args[:user_id])
    current_user.stores.where(active: true).each do |store|
      count_ban = 0
      avito     = AvitoService.new(store: store)
      next if avito.token_status == 403

      response = avito.connect_to('https://api.avito.ru/autoload/v2/reports/last_completed_report')
      #return error_notice("Ошибка подключения к API Avito") if response.nil? || response.status != 200

      report_id = JSON.parse(response.body)['report_id']
      report_url = "https://api.avito.ru/autoload/v2/reports/#{report_id}"
      response = avito.connect_to(report_url)
      #return error_notice("Ошибка подключения к API Avito") if response.nil? || response.status != 200

      report         = JSON.parse(response.body)
      error_sections = report['section_stats']['sections'].find { |i| i['slug'] = 'error' }

      # ########
      # TODO Need add notice about blocked becose need delete old ad
      # ########

      if error_sections
        count_blocked = error_sections['sections'].find { |i| i['slug'] = 'error_blocked' }['count']

        if count_blocked > 100
          # notice about more deleted
        end

        items_url   = "#{report_url}/items?sections=error_blocked"
        response    = avito.connect_to(items_url)
        blocked     = JSON.parse(response.body)['items']
        blocked_ids = blocked.map { |i| i['ad_id'] }
        blocked_ids.each do |blocked_id|
          store.ban_lists.create(ad_id: blocked_id, expires_at: Time.current + 1.month, report_id: report_id)
          count_ban += 1
        rescue ActiveRecord::RecordNotUnique
          next
        end
      end
      msg = "✅ Added #{count_ban} bans for #{store.manager_name}"
      TelegramService.call(current_user, msg) if count_ban > 0
    end

    nil
  end
end
