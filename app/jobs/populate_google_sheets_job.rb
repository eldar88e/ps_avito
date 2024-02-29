class PopulateGoogleSheetsJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default

  def perform(*args)
    file_id     = Setting.pluck(:var, :value).to_h["tid_#{args[:site]}"]
    games       = Game.order(:top)

    session     = GoogleDrive::Session.from_service_account_key('key.json')
    spreadsheet = session.file_by_id(file_id)
    worksheet   = spreadsheet.worksheets.first

    idx = 2
    games.each_slice(100) do |games_slice |
      games_slice.each do |game|
        worksheet[idx, 7]  = game.sony_id
        worksheet[idx, 12] = game.name
        worksheet[idx, 13] = description(game)
        worksheet[idx, 14] = game.price
        worksheet[idx, 15] = make_image(game, args[:site])
        idx += 1
      end
      worksheet.save
    end
    nil
  rescue => e
    TelegramService.new("Error #{self.class} || #{e.message}").report
    raise
  end

  private

  def make_image(game, site)
    if game.images.attached? && game.images.blobs.any? { |i| i.metadata[:site] == site }
      image = game.images.find { |i| i.blob.metadata[:site] == site }
      rails_blob_url(image, host: 'server.open-ps.ru')
    else
      nil
    end
  end

  def description(game)
    <<~DESCR
      Игра #{game.name}
  
      Русская озвучка: #{game.rus_voice ? 'Есть' : 'Нет'}
      Русская субтитры: #{game.rus_screen ? 'Есть' : 'Нет'}
      
      Платформа: #{game.platform}
  
      Цена указана с учетом февральской акции! Предложение актуально до 29 февраля!
      Наша команда «OPEN PS STORE» занимается оформлением игр и подписок более 3-х лет.
      Работаем каждый день с 09:00 до 23:30 по Московскому времени.

      ⭐️ Быстрое оформление, от 3 минут
      ⭐️ Более 3000 отзывов
      ⭐️ Гарантия от блокировки
      
      Напишите нам и мы оформим Вам игру на вашу приставку, все что Вам останется - это скачать игру и насладиться процессом.
      
      Подпишитесь на наш профиль, там вы сможете найти много интересных игр по самым низким ценам
      
      Теги: рlаystаtiоn рlus, рs+, рs рlus, Подписка РSN, Подписка, Рlаystаtiоn 12 месяцев, подписка рs рlus, подписка рs, рlаystаtiоn+, рs+, рs+ 12 месяцев, подписка рs рlus, рs stоrе, рlаy, псн Турция, stаtiоn stоrе, игры для рs4, рs4, рs5, 4, 5, игра для приставки, подписка, Подписка на год, месяц, подписка ехtrа, подписка dеluхе, Экстра, Делюкс, Essential, Extra, Ea Play pro
    DESCR
  end
end
