module Avito
  module ReportsHelper
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

    def badge_status(status)
      case status
      when /warning/
        'warning text-dark'
      when /success/
        'success'
      when /error/
        'danger'
      else
        'primary'
      end
    end

    def safe_html(html)
      whitelist = {
        elements: %w[div span ul li br b i strong em p a],
        attributes: { 'a' => %w[href title] }
      }
      Sanitize.fragment(html, whitelist).html_safe
    end
  end
end