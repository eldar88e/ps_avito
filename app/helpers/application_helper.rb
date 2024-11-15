module ApplicationHelper
  include Pagy::Frontend

  def img_resize(image, **args)
    return unless image.attached?

    attachment = Rails.cache.fetch("image_resize_#{image.id}_#{args}", expires_in: 1.hour) do
      image.variant(resize_to_limit: [args[:width], args[:height] || args[:width]]).processed
    end
    url_for attachment
  rescue StandardError => e
    Rails.logger.error '*' * 100
    Rails.logger.error e.message
    Rails.logger.error '*' * 100
  end

  def format_date(date)
    return unless date.present?

    tz = TZInfo::Timezone.get(Rails.application.config.time_zone)
    if date.class == ActiveSupport::TimeWithZone
      date.strftime('%H:%M %d.%m.%Yг.')
    else
      tz.utc_to_local(Time.parse(date)).strftime('%H:%M %d.%m.%Yг.')
    end
  end

  def paginator(ends, starts = 0)
    if ends > 5
      max  = starts == 0 ? 4 : 5
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

    str.length > max_length ? str[0, max_length] + '...' : str
  end
end
