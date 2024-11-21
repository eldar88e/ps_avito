module Avito
  module ReportsHelper
    BADGE_STYLES = {
      'error_rejected' => 'bg-warning text-dark',
      'error_deleted' => 'bg-danger',
      'removed_complete' => 'bg-danger',
      'error_blocked' => 'bg-dark',
      'success_added' => 'bg-success',
      'success_activated_updated' => 'bg-info text-dark',
      'success_skipped' => 'bg-light text-dark',
      'stopped_by_expiration' => 'bg-secondary'
    }.freeze
    WHITELIST  = %w[div span ul li br b i strong em p a].freeze
    ATTRIBUTES = %w[href title].freeze

    def badge_style(slug)
      BADGE_STYLES[slug] || 'bg-primary'
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

    def sanitize(html)
      super(html, { elements: WHITELIST, attributes: { 'a' => ATTRIBUTES } })
    end
  end
end
