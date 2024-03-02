class DescriptionService
  def initialize(game)
    @game = game
  end

  def desc_open_ps
    <<~DESCR
      <p><strong>Игра для Playstation #{@game.name}</strong></p>

      <ul>
          <li>Русская голос: #{@game.rus_voice ? 'Есть' : 'Нет'}</li>
          <li>Русское меню и текст: #{@game.rus_screen ? 'Есть' : 'Нет'}</li>
      </ul>

      <p>Приставка: #{@game.platform}</p>
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

  def desc_open_ps_store
    <<~DESCR
      <p>Игра #{@game.name}</p>
  
      <p>Русская озвучка: #{@game.rus_voice ? 'Есть' : 'Нет'}</p>
      <p>Русская субтитры: #{@game.rus_screen ? 'Есть' : 'Нет'}</p> 
      
      Платформа: #{@game.platform}
  
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

  def desc_alexander
    <<~DESCR
      <p><strong>#{@game.name} игра для Playstation, (не диск)</strong></p>

      <p>Русская озвучка: #{@game.rus_voice ? 'Есть' : 'Нет'}</p>
      <p>Русская субтитры: #{@game.rus_screen ? 'Есть' : 'Нет'}</p>    

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
