class WatermarkService
  include Rails.application.routes.url_helpers
  include Magick

  attr_reader :image

  def initialize(**args)
    @main_font = args[:main_font]
    @game      = args[:game]
    @product   = args[:product]
    @store     = args[:store]
    @settings  = args[:settings]
    @width     = (@settings[:avito_img_width] || 1920).to_i
    @height    = (@settings[:avito_img_height] || 1440).to_i
    @new_image = initialize_first_layer
    img_url    = find_main_ad_img
    @image     = image_exist?(img_url)
    layers_row = make_layers_row

    @platforms, @layers = layers_row.compact.partition { |i| i[:layer_type] == 'platform' }
    @layers << { img: img_url, menuindex: @store.menuindex,
                 params: @store.game_img_params.presence || {}, layer_type: 'img' }
    @layers.sort_by! { |layer| layer[:menuindex] }

    if @platforms.present? && !@product
      platform = make_platform
      @layers << platform if platform.present?
    end
    @layers << make_slogan(args[:address])
  end

  def add_watermarks
    @layers.each do |layer|
      layer[:params] =
        if layer[:params].is_a?(Hash)
          layer[:params]
        else
          eval(layer[:params]).transform_keys { |key| key.to_s } if layer[:params].present?
        end
      layer[:params] = rewrite_pos_size(layer[:params])
      layer[:layer_type] == 'text' ? add_text(layer) : add_img(layer)
    end

    @new_image
  end

  private

  def rewrite_pos_size(args)
    return {} if args.blank?

    formated_args = {}
    formated_args['pos_x']  = args['pos_x'].to_i > @width ? @width : args['pos_x'].to_i     if args['pos_x'].present?
    formated_args['pos_y']  = args['pos_y'].to_i > @height ? @height : args['pos_y'].to_i   if args['pos_y'].present?
    formated_args['row']    = args['row'].to_i > @width ? @width : args['row'].to_i         if args['row'].present?
    formated_args['column'] = args['column'].to_i > @height ? @height : args['column'].to_i if args['column'].present?

    args.merge formated_args
  end

  def add_img(layer)
    return if layer[:layer_type] == 'flag' && !@game.rus_screen && !@game.rus_voice

    params = layer[:params]
    img    = Image.read(layer[:img]).first
    if (params['column'] && !params['column'].zero?) || (params['row'] && !params['row'].zero?)
      img.resize_to_fit!(params['row'], params['column'])
    end
    @new_image.composite!(img, params['pos_x'] || 0, params['pos_y'] || 0, OverCompositeOp)
  end

  def add_text(layer)
    return unless layer[:title].present?

    params             = layer[:params]
    text_obj           = Draw.new
    text_obj.font      = layer[:img] || @main_font || 'Arial'
    text_obj.pointsize = params['pointsize'] || 42  # Размер шрифта
    #text_obj.rotate    = params['rotate']&.to_f || 0
    text_obj.fill      = params['fill'] || 'white'
    text_obj.stroke    = params['stroke'] || 'white'  # Цвет обводки текста
    text_obj.gravity   = make_gravity params['gravity']
    text_obj.annotate(@new_image, params['row'] || 0, params['column'] || 0,
                      params['pos_x'] || 0, params['pos_y'] || 0, layer[:title])
  end

  def make_gravity(gravity)
    { 'top_left'      => NorthWestGravity,
      'top_center'    => NorthGravity,
      'top_right'     => NorthEastGravity,
      'middle_left'   => WestGravity,
      'middle_center' => CenterGravity,
      'middle_right'  => EastGravity,
      'bottom_left'   => SouthWestGravity,
      'bottom_center' => SouthGravity,
      'bottom_right'  => SouthEastGravity
    }[gravity] || NorthWestGravity
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

  def image_exists?(url)
    return false if url.match?(/\Ahttp/)

    uri      = URI.parse(url)
    response = Net::HTTP.get_response(uri)
    response.is_a?(Net::HTTPSuccess)
  end

  def find_main_ad_img
    return "./game_images/#{@game.sony_id}_#{@settings[:game_img_size]}.jpg" if !@product

    return unless @game.image.attached?

    key = @game.image.blob.key
    if @game.image.blob.service_name == "amazon"
      bucket_name = Rails.application.credentials.dig(:aws, :bucket)
      "https://#{bucket_name}.s3.amazonaws.com/#{key}"
    else
      raw_path = key.scan(/.{2}/)[0..1].join('/')
      "./storage/#{raw_path}/#{key}"
    end
  end

  def make_layers_row
    @store.image_layers.map do |i|
      next if !i.active || @product && i.layer_type == 'flag'

      if i.layer.attached?
        key      = i.layer.blob.key
        raw_path = key.scan(/.{2}/)[0..1].join('/')
        img_path = "./storage/#{raw_path}/#{key}"
        { img: img_path,
          params: i.layer_params.presence || {},
          menuindex: i.menuindex,
          layer_type: i.layer_type,
          title: i.title
        }
      elsif i.layer_type == 'text' && i.title.present?
        { params: i.layer_params.presence || {}, menuindex: i.menuindex, layer_type: i.layer_type, title: i.title }
      else
        nil
      end
    end
  end

  def image_exist?(url)
    url && (File.exist?(url) || (@product && @game.image.blob&.service_name == "amazon" && image_exists?(url)))
  end

  def make_slogan(address)
    slogan = { title: address.slogan, params: address.slogan_params || {} }
    if address.image.attached?
      blob                = address.image.blob
      raw_path            = blob.key.scan(/.{2}/)[0..1].join('/')
      slogan[:img]        = "./storage/#{raw_path}/#{blob.key}"
      slogan[:layer_type] = 'img' if blob[:content_type].match?(/image/)
    end
    slogan[:layer_type] = 'text' unless slogan[:layer_type]
    slogan
  end

  def initialize_first_layer
    Image.new(@width, @height) do |c|
      c.background_color = @settings[:avito_back_color] || '#FFFFFF'
      #c.format           = 'JPEG'
      #c.interlace        = PlaneInterlace
    end
  end
end
