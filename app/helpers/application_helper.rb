module ApplicationHelper
  include Pagy::Frontend

  def format_date(date)
    return unless date.present?

    tz = TZInfo::Timezone.get(Rails.application.config.time_zone)
    if date.class == ActiveSupport::TimeWithZone
      date.strftime('%H:%M %d.%m.%Yг.')
    else
      tz.utc_to_local(Time.parse(date)).strftime('%H:%M %d.%m.%Yг.')
    end
  end

  def paginator(ends, starts=0)
    if ends > 5
      max  = starts == 0 ? 4 : 5
      page = (params[:page].present? && params[:page].to_i.positive?) ? params[:page].to_i : starts
      page = ends if page > ends
      if page < max
        [starts, starts+1, starts+2, starts+3, starts+4, '...', ends]
      elsif page >= ends - 3 && page <= ends
        [starts, '...', ends-4, ends-3, ends-2, ends-1, ends]
      else
        [starts, '...', page-1, page, page+1, '...', ends]
      end
    else
      [*starts..ends]
    end
  end
end
