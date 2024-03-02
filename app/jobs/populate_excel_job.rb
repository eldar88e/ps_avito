require_relative 'pupulate_methods'

class PopulateExcelJob < ApplicationJob
  include Rails.application.routes.url_helpers
  include PopulateMethods
  queue_as :default

  def perform(**args)
    games = Game.order(:top)
    name  = "top_1000_#{args[:site]}.xlsx"
    file  = Axlsx::Package.new

    file.workbook.add_worksheet(:name => "TOP_1000") do |sheet|
      sheet.add_row ['Авито.Статус',	'Авито.ID',	'Авито.ДатаОкончания',	'Авито.М. Просмотры',	'Авито.М. Контакты',
                     'Авито.М. Избранное',	'SYSTEM_ID',	'Дата и время начала размещения',	'Имя менеджера',
                     'Телефон',	'Полный адрес объекта',	'Название объявления',	'Текст объявления',	'Цена в рублях',
                     'Фотографии',	'Фото.Готовые']

      games.each do |game|
        sheet.add_row [nil, nil, nil, nil, nil, nil, game.sony_id, nil, nil, nil, nil, make_name(game),
                       description(game, args[:site]), game.price, make_image(game, args[:site])]
      end
    end
    file.use_shared_strings = true
    file.serialize(name)
    FtpService.new(args[:site]).send_file
  rescue => e
    TelegramService.new("Error #{self.class} || #{e.message}").report
    raise
  end
end
