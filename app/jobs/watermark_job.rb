class WatermarkJob < ApplicationJob
  queue_as :default

  def perform(**args)
    size  = Setting.all.pluck(:var, :value).to_h['game_img_size']
    games = Game.order(:top)
    games.each do |game|
      next if game.image.attached?

      sony_id    = game.sony_id
      #in_img_url = "https://store.playstation.com/store/api/chihiro/00_09_000/container/TR/tr/99/#{sony_id}/0/image?w=#{size}&h=#{size}"
      #sleep rand(1..3)

      begin
        image = Magick::Image.read(in_img_url).first
      rescue => e
        Rails.logger.error "Class: #{e.class} || Error message: #{e.message}"
        TelegramService.new("Bad sony_id #{sony_id} skipped!").report
        next
      end

      add_frame(image)
      add_platform_logo(image, game)
      add_flag_logo(image) if game.rus_screen || game.rus_voice

      temp_file = Tempfile.new(%w[image .jpg])
      image.write(temp_file.path)
      temp_file.flush

      name_path = "#{sony_id}_#{size}.jpg"
      game.image.attach(io: File.open(temp_file.path), filename: name_path, content_type: 'image/jpeg')

      save_game(game)

      temp_file.close
      temp_file.unlink
    end
  rescue => e
    TelegramService.new("Error #{self.class} || #{e.message}").report
    raise
  end

  private

  def save_game(game)
    if game.save
      # success!
    else
      Rails.logger.error "Error save attach image for game id: #{game.id}"
    end
  end

  def add_frame(image)
    frame = Magick::Image.read('app/assets/images/digit_game.png').first
    frame.resize_to_fit!(image.columns, image.rows)
    image.composite!(frame, 0, 0, Magick::OverCompositeOp)
  end

  def add_platform_logo(image, game)
    platform_logo =
      if game.platform == 'PS5, PS4'
        'ps5_ps4'
      elsif game.platform == 'PS5'
        'ps5'
      elsif game.platform.match?(/PS4/)
        'ps4'
      end
    logo = Magick::Image.read("app/assets/images/#{platform_logo}.png").first
    size = game.platform == 'PS5, PS4' ? 6 : 10
    logo.resize_to_fit!(image.columns / size, image.rows / size)
    logo_position_x = image.columns - image.columns + 10
    logo_position_y = image.rows - image.rows + 10
    image.composite!(logo, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end

  def add_flag_logo(image)
    logo = Magick::Image.read('app/assets/images/ru.png').first
    logo.resize_to_fit!(image.columns / 15, image.rows / 15)
    logo_position_x = image.columns - logo.columns - 20
    logo_position_y = image.rows - image.rows + 20
    image.composite!(logo, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end
end
