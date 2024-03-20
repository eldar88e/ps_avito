class WatermarkService
  include Rails.application.routes.url_helpers

  attr_reader :image

  def initialize(**args)
    @game     = args[:game]
    img_url   = "./game_images/#{@game.sony_id}_#{args[:size]}.jpg"
    @image    = File.exist?(img_url)

    ########
    # @site     = args[:site]
    # @flag_ico = Magick::Image.read("app/assets/images/#{@site}_ru.png").first
    # @pl_ico   = Magick::Image.read("app/assets/images/#{@site}_#{@platform}.png").first
    # store: store, address: address, size: size, game: game
    ######

    # @slogan       = 'Низкие цены' # args[:slogan]
    # slogan_params = { row: 400, column: 100, pos_x: 1100, pos_y: 100 }
    # img_params    = { order: 2, row: 1024, column: 1024, pos_x: 448, pos_y: 208 }  # store[:params]
    layers       = [      # store[:layers]
      { img: 'app/assets/images/img_wal.png', params: { order: 1, row: 1920, column: 1440, pos_x: 0, pos_y: 0 } },
      { img: 'app/assets/images/img_frame.png', params: { order: 3, row: 1024, column: 1024, pos_x: 448, pos_y: 208 } },
      { img: 'app/assets/images/img_joystick.png', params: { order: 4, row: 586, column: 767, pos_x: 1270, pos_y: 700 } },
      { img: 'app/assets/images/img_flag.png', params: { order: 5, row: 187, column: 107, pos_x: 448, pos_y: 1280 } },
      { text: 'ПС СТОР', params: { order: 6, font: 'app/assets/images/nocontinuerusbydaymarius.ttf', pointsize: 42,
                                   fill: 'white', stroke: 'white', row: 400, column: 100, pos_x: 448, pos_y: 100 } },
      { platform: 'ps4', img: 'app/assets/images/PS4.png', params: { pos_x: 1280, pos_y: 1300 } },
      { platform: 'ps5', img: 'app/assets/images/PS5.png', params: { pos_x: 1280, pos_y: 1300 } },
      { platform: 'ps4_ps5', img: 'app/assets/images/PS4_PS5.png', params: { pos_x: 1050, pos_y: 1300 } },
    ]

    layers_row = args[:store].image_layers.map do |i|
      if i.layer.attached?
        key = i.layer.blob.key
        raw_path = key.scan(/.{2}/)[0..1].join('/')
        img_path = "./storage/#{raw_path}/#{key}"
        { img: img_path, params: i.params || {}, menuindex: i.menuindex, layer_type: i.layer_type }
      else
        nil
      end
    end.compact

    @platforms, @layers = layers_row.partition { |i| i[:layer_type] == :platform }
    @layers << { img: img_url, menuindex: args[:store].menuindex, params: args[:store].game_img_params || {}, :layer_type=>"img" }
    @layers.sort_by! { |layer| layer[:menuindex] }

    if @platforms.present?
      platform = make_platform
      platform[:layer_type] = :img
      @layers << platform
    end

    @layers << { text: args[:address].slogan, params: args[:address].slogan_params || {}, layer_type: :text } if args[:address].slogan.present?

    @new_image = nil
  end

  def add_watermarks
    #add_frame
    #if @site == 'open_ps'
    #  add_platform_logo_one
    #  add_flag_logo_one if @game.rus_screen || @game.rus_voice
    #else
    #  add_platform_logo
    #  add_flag_logo if @game.rus_screen || @game.rus_voice
    #end

    @layers.each_with_index do |layer, idx|
      if layer[:layer_type] == :text
        add_text(layer)
      else
        add_img(layer, idx)
      end
    end

    @new_image
  rescue => e
    puts e.message
    binding.pry
  end

  private

  def add_img(layer, idx)
    params = layer[:params]
    img    = Magick::Image.read(layer[:img]).first
    img.resize_to_fit!(params['row'], params['column']) if params['row'] && params['column']
    return @new_image = img if idx == 0

    @new_image.composite!(img, params['pos_x'] || 0, params['pos_y'] || 0, Magick::OverCompositeOp)
  end

  def add_text(layer)
    unless @new_image
      e = "No set main layer"
      Rails.logger.error "Class: #{self.class} || Error message: #{e}"
      TelegramService.new(e).report
      return
    end

    params               = layer[:params]
    text_obj             = Magick::Draw.new
    text_obj.font        = params['font'] || 'Verdana'
    text_obj.pointsize   = params['pointsize'] || 42  # Размер шрифта
    text_obj.fill        = params['fill'] || 'white'
    text_obj.stroke      = params['stroke'] || 'white'   # Цвет обводки текста
    text_obj.gravity     = Magick::LeftGravity  if params[:center]

    text_obj.annotate(@new_image, params['row'] || 0, params['column'] || 0, params['pos_x'] || 0, params['pos_y'] || 0, layer[:text] || '')
  end

  def make_platform
    if @game.platform == 'PS5, PS4'
      @platforms.find { |i| i[:title] == 'ps4_ps5' }
    elsif @game.platform == 'PS5'
      @platforms.find { |i| i[:title] == 'ps5' }
    elsif @game.platform.match?(/PS4/)
      @platforms.find { |i| i[:title] == 'ps4' }
    end
  end


  #################################################
  def read_image(url)
    Magick::Image.read(url).first
  rescue => e
    Rails.logger.error "Class: #{e.class} || Error message: #{e.message}"
    TelegramService.new("The picture #{url} is missing!").report

    nil
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
