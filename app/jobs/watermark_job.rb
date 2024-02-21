class WatermarkJob < ApplicationJob
  queue_as :default

  def perform(**args)
    games = Game.order(:top).limit(100) #del limit
    games.each do |game|
      next if game.image.attached?

      sony_id    = game.sony_id
      in_img_url = "https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/#{sony_id}/0/image?_version=00_09_000&platform=chihiro&bg_color=000000&opacity=100&w=#{args[:size]}&h=#{args[:size]}"
      sleep rand(1..5)

      image = Magick::Image.read(in_img_url).first

      frame = Magick::Image.read('app/assets/images/digit_game.png').first
      frame.resize_to_fit!(image.columns, image.rows)
      image.composite!(frame, 0, 0, Magick::OverCompositeOp)

      #platform logo
      platform_logo =
        if game.platform == 'PS5, PS4'
          'ps5_ps4'
        elsif game.platform == 'PS5'
          'ps5'
        elsif game.platform == 'PS4'
          'ps4'
        end
      logo = Magick::Image.read("app/assets/images/#{platform_logo}.png").first
      size = game.platform == 'PS5, PS4' ? 6 : 10
      logo.resize_to_fit!(image.columns / size, image.rows / size)
      logo_position_x = image.columns - image.columns + 10
      logo_position_y = image.rows - image.rows + 10
      image.composite!(logo, logo_position_x, logo_position_y, Magick::OverCompositeOp)

      #logo_flag
      if game.rus_screen || game.rus_voice
        logo = Magick::Image.read('app/assets/images/ru.png').first
        logo.resize_to_fit!(image.columns / 15, image.rows / 15)
        logo_position_x = image.columns - logo.columns - 20
        logo_position_y = image.rows - image.rows + 20
        image.composite!(logo, logo_position_x, logo_position_y, Magick::OverCompositeOp)
      end

      temp_file = Tempfile.new(['image', '.jpg'])
      image.write(temp_file.path)
      temp_file.flush

      name_path = "#{sony_id}_#{args[:size]}.jpg"
      game.image.attach(io: File.open(temp_file.path), filename: name_path, content_type: 'image/jpeg')

      if game.save
        # Ваш код успешного сохранения
      else
        # Ваш код обработки ошибок
      end

      # Закрываем временный файл и удаляется
      temp_file.close
      temp_file.unlink
    end
  end
end
