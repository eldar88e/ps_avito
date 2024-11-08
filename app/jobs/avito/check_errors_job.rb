class Avito::CheckErrorsJob < Avito::BaseApplicationJob
  queue_as :default
  BAN_PERIOD = 3.weeks

  def perform(**args)
    stores =
      if args[:store]
        [args[:store]]
      else
        return unless args[:user_id]

        current_user(args[:user_id]).stores.active
      end
    current_user = stores.first.user

    stores.each do |store|
      avito = AvitoService.new(store: store)
      next if avito.token_status == 403

      url         = 'https://api.avito.ru/autoload/v2/reports/last_completed_report'
      last_report = fetch_and_parse(avito, url)
      next unless last_report

      report_id  = last_report['report_id']
      report_url = "https://api.avito.ru/autoload/v2/reports/#{report_id}"
      report     = fetch_and_parse(avito, report_url)
      next unless report

      error_sections = report['section_stats']['sections'].select { |i| i['slug'] == 'error' }
      next unless error_sections

      error_blocked = error_deleted = false
      error_sections.each do |error|
        error_blocked ||= error['sections'].any? { |i| i['slug'] == 'error_blocked' }
        error_deleted ||= error['sections'].any? { |i| i['slug'] == 'error_deleted' }

        error['sections'].each { |section| send_error_sections(section, current_user, store.manager_name) }
      end
      Avito::CheckDeletedJob.send(job_method, user: current_user, store: store) if error_deleted
      next unless error_blocked

      ads       = store.ads.active.load
      count_ban = [0]
      blocked   = fetch_and_add_ban_ad(report_url, avito, store, ads, count_ban)
      if blocked['meta']['pages'] > 1
        [*1..blocked['meta']['pages']-1].each do |page|
          fetch_and_add_ban_ad(report_url, avito, store, ads, count_ban, page)
        end
      end
      msg = I18n.t('avito.job.check_errors', count: count_ban[0], name: store.manager_name)
      TelegramService.call(store.user, msg) if count_ban[0] > 0
    end

    nil
  end

  private

  def fetch_and_add_ban_ad(report_url, avito, store, ads, count_ban, page=nil)
    url     = "#{report_url}/items?sections=error_blocked&page=#{page}&per_page=100"
    blocked = fetch_and_parse(avito, url)
    add_ban_ad(ads, store, blocked, count_ban) if blocked
    blocked
  end

  def add_ban_ad(ads, store, blocked, count_ban) # , report_id
    blocked['items'].each do |item|
      id             = item['ad_id'].to_i
      ban_list_entry = ads.find { |ad| ad.id == id }

      if ban_list_entry.nil?
        msg = "Not existing ad with id #{id}"
        Rails.logger.error msg
        TelegramService.call(store.user, msg)
      elsif ban_list_entry.banned_until.nil? || ban_list_entry.banned_until <= Time.current
        ban_list_entry.update(banned: true, banned_until: Time.current + BAN_PERIOD) # report_id: report_id
        count_ban[0] += 1
      end
    end
  end

  def send_error_sections(section, user, account)
    TelegramService.call(user, "‼️#{section['title']} #{section['count']} на аккаунте #{account}.")
  end
end
