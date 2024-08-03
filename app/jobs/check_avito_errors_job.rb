class CheckAvitoErrorsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    stores =
      if args[:store]
        [args[:store]]
      else
        return unless args[:user_id]
        current_user = current_user(args[:user_id])
        current_user.stores.where(active: true)
      end

    stores.each do |store|
      count_ban = 0
      avito     = AvitoService.new(store: store)
      next if avito.token_status == 403

      url         = 'https://api.avito.ru/autoload/v2/reports/last_completed_report'
      last_report = fetch_and_parse(avito, url)
      next unless last_report

      report_url = "https://api.avito.ru/autoload/v2/reports/#{last_report['report_id']}"
      report     = fetch_and_parse(avito, report_url)
      next unless report

      error_sections = report['section_stats']['sections'].find { |i| i['slug'] = 'error' }
      next unless error_sections

      error_sections['sections'].each { |section| send_error_sections(section, current_user, store.manager_name) }

      next unless error_sections['sections'].find { |i| i['slug'] == 'error_blocked' }

      url         = "#{report_url}/items?sections=error_blocked"
      blocked     = fetch_and_parse(avito, url)['items']
      blocked_ids = blocked.map { |i| i['ad_id'] }

      blocked_ids.each do |id|
        store.ban_lists.create(ad_id: id, expires_at: Time.current + 1.month, report_id: report_id)
        count_ban += 1
      rescue ActiveRecord::RecordNotUnique
        old_ad = store.ban_lists.find_by(ad_id: id)
        if old_ad.expires_at > Time.current
          next
        else
          old_ad.update(expires_at: Time.current)
          count_ban += 1
        end
      end

      msg = "✅ Added #{count_ban} bans for #{store.manager_name}"
      TelegramService.call(current_user, msg) if count_ban > 0
    end

    nil
  end

  def send_error_sections(section, user, account)
    TelegramService.call(user, "‼️#{section['title']} #{section['count']} на аккаунте #{account}.")
  end

  def fetch_and_parse(avito, url)
    response = avito.connect_to(url)
    return if response.nil? || response.status != 200

    JSON.parse(response.body)
  end
end
