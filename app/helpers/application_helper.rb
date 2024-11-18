module ApplicationHelper
  include Pagy::Frontend

  def img_resize(image, **args)
    return unless image.attached?

    height = args[:height] || args[:width]
    url_for image.variant(resize_to_limit: [args[:width], height]).processed
  end

  def format_date(date)
    return if date.blank?

    tz = TZInfo::Timezone.get(Rails.application.config.time_zone)
    return date.strftime('%H:%M %d.%m.%Yг.') if date.instance_of?(ActiveSupport::TimeWithZone)

    tz.utc_to_local(Time.zone.parse(date)).strftime('%H:%M %d.%m.%Yг.')
  end

  def paginator(ends, starts = 0)
    if ends > 5
      max  = starts.zero? ? 4 : 5
      page = params[:page].present? && params[:page].to_i.positive? ? params[:page].to_i : starts
      page = ends if page > ends
      if page < max
        [starts, starts + 1, starts + 2, starts + 3, starts + 4, '...', ends]
      elsif page >= ends - 3 && page <= ends
        [starts, '...', ends - 4, ends - 3, ends - 2, ends - 1, ends]
      else
        [starts, '...', page - 1, page, page + 1, '...', ends]
      end
    else
      [*starts..ends]
    end
  end

  def truncate_string(str, max_length)
    return if str.nil?

    str.length > max_length ? "#{str[0, max_length]}..." : str
  end
end
