class PopulateGoogleSheetsJob < ApplicationJob
  include Rails.application.routes.url_helpers
  queue_as :default

  def perform(**args)
    file_id     = Setting.pluck(:var, :value).to_h["tid_#{args[:site]}"]
    games       = Game.order(:top)

    session     = GoogleDrive::Session.from_service_account_key('key.json')
    spreadsheet = session.file_by_id(file_id)
    worksheet   = spreadsheet.worksheets.first

    idx = 2
    games.each_slice(100) do |games_slice |
      games_slice.each do |game|
        worksheet[idx, 7]  = game.sony_id
        worksheet[idx, 12] = make_name(game)
        worksheet[idx, 13] = description(game, args[:site])
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

  def make_name(game)
    raw_name = game.name
    platform  = game.platform

    if platform == 'PS5, PS4' || platform.match?(/PS4/) #ps4, ps5
      prefix = '(PS5 and PS4)'
      if raw_name.downcase.match?(/ps4/)
        if raw_name.downcase.match?(/ps5/)
          raw_name
        else
          raw_name.sub('(PS4)', '').sub('PS4', '') + prefix
        end
      else
        if raw_name.downcase.match?(/ps5/)
          raw_name.sub('(PS5)', '').sub('PS5', '') + prefix
        else
          raw_name + prefix
        end
      end
    else #ps5
      if raw_name.downcase.match?(/ps5/)
        raw_name
      else
        raw_name + '(PS5)'
      end
    end
  end

  def make_image(game, site)
    if game.images.attached? && game.images.blobs.any? { |i| i.metadata[:site] == site }
      image = game.images.find { |i| i.blob.metadata[:site] == site }
      rails_blob_url(image, host: 'server.open-ps.ru')
    else
      nil
    end
  end

  def description(game, site)
    method_name = "desc_#{site}".to_sym
    send(method_name, game)
  end

  def desc_open_ps(game)
    <<~DESCR
      <p><strong>Игра для Playstation #{game.name}</strong></p>

      <ul>
          <li>Русская голос: #{game.rus_voice ? 'Есть' : 'Нет'}</li>
          <li>Русское меню и текст: #{game.rus_screen ? 'Есть' : 'Нет'}</li>
      </ul>

      <p>Приставка: #{game.platform}</p>
      <p>Мартовская распродажа, скидки до 70%!</p>
      <p>Наша компания <strong>Open-Ps</strong> занимается продажей игр более трех лет и у нас более 5000 отзывов!</p>
      <p>Мы на связи 24 часа в сутки, пишите в любое время!</p>
      <ul>
          <li>💣 Самые низкие цены, если найдете дешевле - напишите нам.</li>
          <li>💣 Игра только Ваша и остается у Вас навсегда, можно удалить и скачать заново.</li>
          <li>💣 Не нужно никуда ехать и ждать, все происходит дистанционно, процедура занимает 5 минут.</li>
          <li>💣 У наc Вы cможетe приoбpеcти ЛЮБУЮ игру/подписку для РS4/PS5.</li>
      </ul>
      <p>Подписывайтесь на наш профиль и отслеживайте самые большие скидки.</p>
      <p>Теги: рlаystаtiоn рlus, рs+, рs рlus, Подписка РSN, Подписка, Рlаystаtiоn 12 месяцев, подписка рs рlus, 
      подписка рs, рlаystаtiоn+, рs+, рs+ 12 месяцев, подписка рs рlus, рs stоrе, рlаy, псн Турция, stаtiоn stоrе, 
      игры для рs4, рs4, рs5, 4, 5, игра для приставки, подписка, Подписка на год, месяц, подписка ехtrа, подписка 
      dеluхе, Экстра, Делюкс, Essential, Extra, Ea Play pro</p>
    DESCR
  end

  def desc_open_ps_store(game)
    <<~DESCR
      <p>Игра #{game.name}</p>
  
      <p>Русская озвучка: #{game.rus_voice ? 'Есть' : 'Нет'}</p>
      <p>Русская субтитры: #{game.rus_screen ? 'Есть' : 'Нет'}</p> 
      
      Платформа: #{game.platform}
  
      Цена указана с учетом февральской акции! Предложение актуально до 31 марта!
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

  def desc_alexander(game)
    <<~DESCR
      <p><strong>#{game.name} игра для Playstation, (не диск)</strong></p>

      <p>Русская озвучка: #{game.rus_voice ? 'Есть' : 'Нет'}</p>
      <p>Русская субтитры: #{game.rus_screen ? 'Есть' : 'Нет'}</p>    

      <p>Наша команда <strong>Open-PS</strong> занимается оформлением игр и подписок для Playstation с 2021 года.</p>
      <ul>
          <li>🔥 Мы можем оформить ЛЮБУЮ игру / подписку / дополнение для игры / донат для PS4 и PS5</li>
          <li>🔥 Вы нашли игру дешевле? Напишите нам и мы сделаем Вам скидку.</li>
          <li>🔥 Быстрое оформление (от 5 минут)</li>
          <li>🔥 Более 5000 отзывов</li>
          <li>🔥 Работаем каждый день с 09:00 до 23:40 по Московскому времени</li>
      </ul>
      <p>Подпишитесь на профиль, чтобы не потерять объявление и быть в курсе всех распродаж.</p>
      <p>Теги: рlаystаtiоn рlus, рs+, рs рlus, Подписка РSN, Подписка, Рlаystаtiоn 12 месяцев, подписка рs рlus, подписка 
      рs, рlаystаtiоn+, рs+, рs+ 12 месяцев, подписка рs рlus, рs stоrе, рlаy, псн Турция, stаtiоn stоrе, игры для рs4, 
      рs4, рs5, 4, 5, игра для приставки, подписка на год, месяц, подписка ехtrа, подписка dеluхе, Экстра, Делюкс, 
      Essential, Extra, Ea Play pro</p>
    DESCR
  end
end
