class PopulateExcelJob < ApplicationJob
  include Rails.application.routes.url_helpers
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
    DescriptionService.new(game).send(method_name)
  end
end
