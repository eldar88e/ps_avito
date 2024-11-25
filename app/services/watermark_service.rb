class WatermarkService
  include Rails.application.routes.url_helpers
  include Magick

  def initialize(**args)
    @game         = args[:game]
    @is_product   = args[:product]
    @store        = args[:store]
    @settings     = args[:settings]
    @main_font    = @settings[:main_font]
    @width        = (@settings[:avito_img_width] || 1920).to_i
    @height       = (@settings[:avito_img_height] || 1440).to_i
    @new_image    = initialize_first_layer
    @main_img_url = fetch_image_url
    handle_layers(args[:address])
  end

  def image_exist?
    return false if @main_img_url.blank?

    @game.image.blob&.service_name&.match?(/local|test/) ? File.exist?(@main_img_url) : check_img?(@main_img_url)
  end

  def add_watermarks
    @layers.each do |layer|
      layer[:params] = prepare_layer_params(layer[:params])
      layer[:layer_type] == 'text' ? add_text(layer) : add_img(layer)
    end

    @new_image
  end

  private

  def handle_layers(address)
    layers_row = make_layers_row
    @platforms, @layers = layers_row.partition { |i| i[:layer_type] == 'platform' }
    @layers << { img: @main_img_url, menuindex: @store.menuindex,
                 params: @store.game_img_params.presence || {}, layer_type: 'img' }
    @layers.sort_by! { |layer| layer[:menuindex] }

    if @platforms.present?
      platform = make_platform
      @layers << platform if platform.present?
    end
    @layers << make_slogan(address)
  end

  def prepare_layer_params(params)
    result =
      if params.is_a?(Hash)
        params
      elsif params.present?
        eval(params).transform_keys(&:to_s) # TODO: убрать eval
      end
    rewrite_pos_size(result)
  end

  def rewrite_pos_size(args)
    return {} if args.blank?

    formated_args           = {}
    formated_args['pos_x']  = min_value(args['pos_x'], @width)
    formated_args['pos_y']  = min_value(args['pos_y'], @height)
    formated_args['row']    = min_value(args['row'], @width)
    formated_args['column'] = min_value(args['column'], @height)

    args.merge formated_args
  end

  def min_value(value, max_value)
    value.present? ? [value.to_i, max_value].min : nil
  end

  def add_img(layer)
    img = Image.read(layer[:img]).first
    resize_image!(img, layer[:params])
    @new_image.composite!(img, layer[:params]['pos_x'] || 0, layer[:params]['pos_y'] || 0, OverCompositeOp)
  end

  def resize_image!(img, params)
    return if !params['column'].to_i.positive? && !params['row'].to_i.positive?

    img.resize_to_fit!(params['row'], params['column'])
  end

  def add_text(layer)
    return if layer[:title].blank?

    params             = layer[:params]
    text_obj           = Draw.new
    text_obj.font      = layer[:img] || @main_font || 'Arial'
    text_obj.pointsize = params['pointsize'] || 42 # Размер шрифта
    # text_obj.rotate    = params['rotate']&.to_f || 0
    text_obj.fill      = params['fill'] || 'white'
    text_obj.stroke    = params['stroke'] || 'white' # Цвет обводки текста
    text_obj.gravity   = make_gravity params['gravity']
    text_obj.annotate(@new_image, params['row'] || 0, params['column'] || 0,
                      params['pos_x'] || 0, params['pos_y'] || 0, layer[:title])
  end

  def make_gravity(gravity)
    { 'top_left' => NorthWestGravity,
      'top_center' => NorthGravity,
      'top_right' => NorthEastGravity,
      'middle_left' => WestGravity,
      'middle_center' => CenterGravity,
      'middle_right' => EastGravity,
      'bottom_left' => SouthWestGravity,
      'bottom_center' => SouthGravity,
      'bottom_right' => SouthEastGravity }[gravity] || NorthWestGravity
  end

  def make_platform
    if @game.platform == 'PS5, PS4'
      @platforms.find { |i| i[:title] == 'ps4_ps5' }
    elsif @game.platform == 'PS5'
      @platforms.find { |i| i[:title] == 'ps5' }
    elsif @game.platform.include?('PS4')
      @platforms.find { |i| i[:title] == 'ps4' }
    end
  end

  def check_img?(url)
    return false unless url.start_with?('http')

    uri      = URI.parse(url)
    response = Net::HTTP.get_response(uri)
    response.is_a?(Net::HTTPSuccess)
  end

  def fetch_image_url
    return unless @game.image.attached?

    if @game.image.blob.service_name == 'amazon'
      amazon_link
    elsif @game.image.blob.service_name == 'minio'
      @game.image.url(expires_in: 1.hour)
    else
      local_link
    end
  end

  def amazon_link
    bucket_name = Rails.application.credentials.dig(:aws, :bucket)
    "https://#{bucket_name}.s3.amazonaws.com/#{@game.image.blob.key}"
  end

  def local_link
    @game.image.blob.service.path_for(@game.image.blob.key)
  end

  def make_layers_row
    @store.image_layers.active.filter_map do |layer|
      next if excluded_layer?(layer)

      if layer.layer.attached?
        form_img_layer(layer)
      elsif layer.layer_type == 'text' && layer.title.present?
        build_layer(layer)
      end
    end
  end

  def excluded_layer?(layer)
    return layer.layer_type.match?(/flag|platform/) if @is_product

    layer.layer_type == 'flag' && !@game.rus_screen && !@game.rus_voice
  end

  def build_layer(layer)
    { params: layer.layer_params.presence || {},
      menuindex: layer.menuindex,
      layer_type: layer.layer_type,
      title: layer.title }
  end

  def form_img_layer(row_layer)
    blob  = row_layer.layer.blob
    path  = blob.service.path_for(blob.key)
    layer = build_layer(row_layer)
    layer.merge(img: path)
  end

  def make_slogan(address)
    slogan = { title: address.slogan, params: address.slogan_params || {} }
    if address.image.attached?
      blob                = address.image.blob
      slogan[:img]        = blob.service.path_for(blob.key)
      slogan[:layer_type] = 'img' if blob[:content_type].include?('image')
    end
    slogan[:layer_type] = 'text' unless slogan[:layer_type]
    slogan
  end

  def initialize_first_layer
    Image.new(@width, @height) do |c|
      c.background_color = @settings[:avito_back_color] || '#FFFFFF'
      # c.format           = 'JPEG'
      # c.interlace        = PlaneInterlace
    end
  end
end
