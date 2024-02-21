class PopulateGoogleSheetsJob < ApplicationJob
  queue_as :default

  def perform(*args)
    games       = Game.all.order(:top).limit(100)  #del limit

    session     = GoogleDrive::Session.from_service_account_key('key.json')
    spreadsheet = session.file_by_id(ENV["FILE_ID"])
    worksheet   = spreadsheet.worksheets.first

    ActiveStorage::Current.url_options = { protocol: 'http', host: 'localhost', port: 3000 }

    games.each_with_index do |game, idx|
      worksheet[idx + 2, 12] = game.name
      worksheet[idx + 2, 13] = description(game.name, game.rus_voice, game.rus_screen, game.platform)
      worksheet[idx + 2, 14] = game.price
      worksheet[idx + 2, 15] = game.image.url
    end
    worksheet.save
  end

  private

  def description(name, rus_voice, rus_screen, platform)
    <<~DESCR
      ⚽️Игра #{name}
  
      📌Русская озвучка: #{rus_voice ? 'Есть' : 'Нет'}
      📌Русская субтитры: #{rus_screen ? 'Есть' : 'Нет'}
      
      📌Платформа: #{platform}
  
      📌Оформляем на ваш аккаунт либо создадим вам его бесплатно.
  
      📌Основные преимущества покупки в ПС-СТОР:
        ✅ Без передачи личных данных
        ✅ Без перерывов и выходных
        ✅ Без очередей, за 5 минут
        ✅ Гарантия блокировок
    DESCR
  end
end
