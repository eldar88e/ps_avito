module Avito
  module ReportsHelper
    def format_date(date)
      return unless date.present?

      tz = TZInfo::Timezone.get(Rails.application.config.time_zone)
      tz.utc_to_local(Time.parse(date)).strftime('%H:%M %d.%m.%Yг.')
    end

    def badge_style(slug)
      if slug == 'error_rejected'
        'bg-warning text-dark'
      elsif slug.match?(/error_deleted|removed_complete/)
        'bg-danger'
      elsif slug == 'error_blocked'
        'bg-dark'
      elsif slug == 'success_added'
        'bg-success'
      elsif slug == 'success_activated_updated'
        'bg-info text-dark'
      elsif slug == 'success_skipped'
        'bg-light text-dark'
      elsif slug == 'stopped_by_expiration'
        'bg-secondary'
      else
        'bg-primary'
      end
    end
  end
end