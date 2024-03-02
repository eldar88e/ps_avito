class WatermarkService
  attr_reader :image
  def initialize(**args)
    @game     = args[:game]
    img_url   = "./game_images/#{@game.sony_id}_#{args[:size]}.jpg"
    @image    = read_image(img_url)
    @site     = args[:site]
    @flag_ico = Magick::Image.read("app/assets/images/#{@site}_ru.png").first
    platform  = make_platform(@game)
    @pl_ico   = Magick::Image.read("app/assets/images/#{@site}_#{platform}.png").first
  end

  def add_watermarks
    add_frame

    if @site == 'open_ps'
      add_platform_logo_one
      add_flag_logo_one if @game.rus_screen || @game.rus_voice
    else
      add_platform_logo
      add_flag_logo if @game.rus_screen || @game.rus_voice
    end

    @image
  end

  private

  def read_image(url)
    Magick::Image.read(url).first
  rescue => e
    Rails.logger.error "Class: #{e.class} || Error message: #{e.message}"
    TelegramService.new("The picture #{url} is missing!").report

    nil
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

  def add_frame
    frame = Magick::Image.read("app/assets/images/#{@site}.png").first
    frame.resize_to_fit!(@image.columns, @image.rows)
    @image.composite!(frame, 0, 0, Magick::OverCompositeOp)
  end

  def add_platform_logo_one
    size = @game.platform == 'PS5, PS4' ? 6 : 10
    @pl_ico.resize_to_fit!(@image.columns / size, @image.rows / size)
    logo_position_x = @image.columns - @image.columns + 10
    logo_position_y = @image.rows - @image.rows + 10
    @image.composite!(@pl_ico, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end

  def add_flag_logo_one
    @flag_ico.resize_to_fit!(@image.columns / 23, @image.rows / 23)
    logo_position_x = @image.columns - @flag_ico.columns - 20
    logo_position_y = @image.rows - @image.rows + 20
    @image.composite!(@flag_ico, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end

  def add_platform_logo
    size = @game.platform == 'PS5, PS4' ? 6 : 10
    @pl_ico.resize_to_fit!(@image.columns / size, @image.rows / size)
    logo_position_x = @image.columns - @image.columns + 300
    logo_position_y = @image.rows - @image.rows + 720
    @image.composite!(@pl_ico, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end

  def add_flag_logo
    @flag_ico.resize_to_fit!(@image.columns / 24, @image.rows / 24)
    logo_position_x = @image.columns - @flag_ico.columns - 300
    logo_position_y = @image.rows - @image.rows + 715
    @image.composite!(@flag_ico, logo_position_x, logo_position_y, Magick::OverCompositeOp)
  end
end
