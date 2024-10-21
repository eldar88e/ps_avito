module Avito::ChatsHelper
  def parse_date(raw_date)
    return if raw_date.nil?

    date = Time.at raw_date
    current_date = Date.current
    return date.strftime("%H:%M") if current_date == date.to_date

    return date.strftime("%d %b") if current_date.year == date.year

    date.strftime("%d %b %y")
  end

  def formit_ad_title(ad)
    return if ad.nil?

    title = ad['title'].presence
    return title + ' — ' + (ad['price_string'] || "") if title

    'Объявление временно недоступно'
  end
end
