class AddWatermarkJob < ApplicationJob
  queue_as :default

  def perform(**args)
    size  = Setting.all.pluck(:var, :value).to_h['game_img_size']
    site  = args[:site]
    games = Game.order(:top)
    games.each do |game|
      next if game.images.attached? && game.images.blobs.any? { |i| i.metadata[:site] == site } && args[:rewrite].nil?

      if args[:rewrite].nil? && game.images.attached? && game.images.blobs.any? { |i| i.metadata[:site] == site }
        game.images.each do |image|
          image.purge if image.blob.metadata[:site] == site
        end
      end

      sony_id    = game.sony_id
      img_name   = "#{sony_id}_#{size}"
      in_img_url = "./game_images/#{img_name}.jpg"

      begin
        image = Magick::Image.read(in_img_url).first
      rescue => e
        Rails.logger.error "Class: #{e.class} || Error message: #{e.message}"
        TelegramService.new("The picture #{img_name} is missing!").report
        next
      end

      add_frame(image, site)
      if site == 'open_ps'
        add_platform_logo_one(image, game, site)
        add_flag_logo_one(image, site) if game.rus_screen || game.rus_voice
      else
        add_platform_logo(image, game, site)
        add_flag_logo(image, site) if game.rus_screen || game.rus_voice
      end


      temp_file = Tempfile.new(%w[image .jpg])
      image.write(temp_file.path)
      temp_file.flush

      name_path = "#{sony_id}_#{size}.jpg"
      game.images.attach(io: File.open(temp_file.path), filename: name_path, content_type: 'image/jpeg', metadata: { site: site })

      save_game(game)

      temp_file.close
      temp_file.unlink
      binding.pry
    end
    nil
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

  def add_frame(image, site)
    frame = Magick::Image.read("app/assets/images/#{site}.png").first
    frame.resize_to_fit!(image.columns, image.rows)
    image.composite!(frame, 0, 0, Magick::OverCompositeOp)
  end

  def add_platform_logo(image, game, site)
    platform = make_platform(game)
    logo     = Magick::Image.read("app/assets/images/#{site}_#{platform}.png").first
    size     = game.platform == 'PS5, PS4' ? 6 : 10
    logo.resize_to_fit!(image.columns / size, image.rows / size)
    logo_position_x = image.columns - image.columns + 300
    logo_position_y = image.rows - image.rows + 720
    image.composite!(logo, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end

  def add_flag_logo(image, site)
    logo = Magick::Image.read("app/assets/images/#{site}_ru.png").first
    logo.resize_to_fit!(image.columns / 23, image.rows / 23)
    logo_position_x = image.columns - logo.columns - 300
    logo_position_y = image.rows - image.rows + 715
    image.composite!(logo, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end

  def make_platform(game)
    if game.platform == 'PS5, PS4'
      'ps5_ps4'
    elsif game.platform == 'PS5'
      'ps5'
    elsif game.platform.match?(/PS4/)
      'ps4'
    end
  end

  def add_platform_logo_one(image, game, site)
    platform = make_platform(game)
    logo     = Magick::Image.read("app/assets/images/#{site}_#{platform}.png").first
    size     = game.platform == 'PS5, PS4' ? 6 : 10
    logo.resize_to_fit!(image.columns / size, image.rows / size)
    logo_position_x = image.columns - image.columns + 10
    logo_position_y = image.rows - image.rows + 10
    image.composite!(logo, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end

  def add_flag_logo_one(image, site)
    logo = Magick::Image.read("app/assets/images/#{site}_ru.png").first
    logo.resize_to_fit!(image.columns / 23, image.rows / 23)
    logo_position_x = image.columns - logo.columns - 20
    logo_position_y = image.rows - image.rows + 20
    image.composite!(logo, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end
end
