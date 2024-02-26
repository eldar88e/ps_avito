class PopulateGoogleSheetsJob < ApplicationJob
  queue_as :default

  def perform(*args)
    games       = Game.all.order(:top)

    session     = GoogleDrive::Session.from_service_account_key('key.json')
    spreadsheet = session.file_by_id(ENV["FILE_ID"])
    worksheet   = spreadsheet.worksheets.first

    #ActiveStorage::Current.url_options = { protocol: 'http', host: 'localhost', port: 3000 }
    ActiveStorage::Current.url_options = { protocol: 'http', host: 'server.open-ps.ru' }
    idx = 2
    games.each_slice(100) do |games_slice |
      games_slice.each do |game|
        worksheet[idx, 7]  = game.sony_id
        worksheet[idx, 12] = game.name
        worksheet[idx, 13] = description(game.name, game.rus_voice, game.rus_screen, game.platform)
        worksheet[idx, 14] = game.price
        worksheet[idx, 15] = game.image.url
        idx += 1
      end
      worksheet.save
    end
  rescue => e
    TelegramService.report("Error #{self.class} || #{e.message}")
    raise
  end

  private

  def description(name, rus_voice, rus_screen, platform)
    <<~DESCR
      Игра #{name}
  
      Русская озвучка: #{rus_voice ? 'Есть' : 'Нет'}
      Русская субтитры: #{rus_screen ? 'Есть' : 'Нет'}
      
      Платформа: #{platform}
  
      Цена указана с учетом февральской акции! Предложение актуально до 29 февраля!
      Наша команда «OPEN PS STORE»занимается оформлением игр и подписок более 3-х лет.
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
