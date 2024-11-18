module Avito
  class CheckErrorsJob < Avito::BaseApplicationJob
    queue_as :default
    BAN_PERIOD = 3.weeks

    def perform(**args)
      stores = fetch_stores(args)
      return if stores.blank?

      current_user = stores.first.user
      stores.each do |store|
        avito = AvitoService.new(store:)
        next if avito.token_status == 403

        process_store(store, avito, current_user)
      end
      nil
    end

    private

    def fetch_stores(args)
      return [args[:store]] if args[:store]

      current_user(args[:user_id])&.stores&.active
    end

    def process_store(store, avito, current_user)
      report = fetch_last_report(avito)
      return unless report

      error_sections = report['section_stats']['sections'].select { |i| i['slug'] == 'error' }
      return unless error_sections

      error_blocked = process_error_ads(store, current_user, error_sections)
      process_blocked_ads(store, avito, report['report_url']) if error_blocked
    end

    def fetch_last_report(avito)
      url = 'https://api.avito.ru/autoload/v2/reports/last_completed_report'
      last_report = fetch_and_parse(avito, url)
      return unless last_report

      report_url = "https://api.avito.ru/autoload/v2/reports/#{last_report['report_id']}"
      report = fetch_and_parse(avito, report_url)
      report&.merge('report_url' => report_url)
    end

    def fetch_and_add_ban_ad(report_url, avito, store, ads, count_ban, page = nil)
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

    def process_error_ads(store, user, error_sections)
      error_blocked = error_deleted = false
      error_sections.each do |error|
        error_blocked ||= error['sections'].any? { |i| i['slug'] == 'error_blocked' }
        error_deleted ||= error['sections'].any? { |i| i['slug'] == 'error_deleted' }

        error['sections'].each { |section| send_error_sections(section, user, store.manager_name) }
      end
      Avito::CheckDeletedJob.send(job_method, user:, store:) if error_deleted
      error_blocked
    end

    def process_blocked_ads(store, avito, report_url)
      ads       = store.ads.active.load
      count_ban = [0]
      blocked   = fetch_and_add_ban_ad(report_url, avito, store, ads, count_ban)
      if blocked['meta']['pages'] > 1
        [*1..blocked['meta']['pages'] - 1].each do |page|
          fetch_and_add_ban_ad(report_url, avito, store, ads, count_ban, page)
        end
      end
      msg = I18n.t('avito.job.check_errors', count: count_ban[0], name: store.manager_name)
      TelegramService.call(store.user, msg) if count_ban[0].positive?
    end

    def send_error_sections(section, user, account)
      TelegramService.call(user, "‼️#{section['title']} #{section['count']} на аккаунте #{account}.")
    end
  end
end
