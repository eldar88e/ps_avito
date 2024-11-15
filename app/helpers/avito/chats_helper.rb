module Avito::ChatsHelper
  def parse_date(raw_date)
    return if raw_date.nil?

    date = Time.zone.at raw_date
    current_date = Date.current
    return date.strftime('%H:%M') if current_date == date.to_date

    return date.strftime('%d %b') if current_date.year == date.year

    date.strftime('%d %b %y')
  end

  def formit_ad_title(ad)
    return if ad.nil?

    title = ad['title'].presence
    return title + ' — ' + (ad['price_string'] || '') if title

    'Объявление временно недоступно'
  end

  def formit_msg(content)
    return if content.nil?

    if content['text']
      content['text']
    elsif content['image']
      img = content['image']['sizes']['640x480']
      str = <<-EOF
        <a data-fancybox="msg_img" data-src="#{content['image']['sizes']['1280x960']}" data-caption="1280x960" style="cursor:pointer;">
          <img src='#{img}' style='height: 200px;' />
        </a>
      EOF

      str.html_safe
    elsif content['link']
      content['link']['text']
    elsif content['voice']
      content['voice']['voice_id']
    elsif content['location']
      content['location']['text']
    else
      'Неизвестный тип сообщения:' + "#{content}"
    end
  end
end
