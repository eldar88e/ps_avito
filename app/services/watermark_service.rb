class WatermarkService
  include Rails.application.routes.url_helpers

  attr_reader :image

  def initialize(**args)
    @main_font = args[:main_font]
    @game      = args[:game]
    @product   = args[:product]
    img_url    = if !@product
                   "./game_images/#{@game.sony_id}_#{args[:size]}.jpg"
                 else
                   if @game.image.attached?
                     key      = @game.image.blob.key
                     raw_path = key.scan(/.{2}/)[0..1].join('/')
                     "./storage/#{raw_path}/#{key}"
                   else
                     ''
                   end
                 end
    @image     = File.exist?(img_url)
    layers_row = args[:store].image_layers.map do |i|
      if i.layer.attached?
        key = i.layer.blob.key
        raw_path = key.scan(/.{2}/)[0..1].join('/')
        img_path = "./storage/#{raw_path}/#{key}"
        { img: img_path, params: i.layer_params || {}, menuindex: i.menuindex, layer_type: i.layer_type, title: i.title, active: i.active }
      elsif i.layer_type == 'text' && i.layer_type.present?
        { params: i.layer_params || {}, menuindex: i.menuindex, layer_type: i.layer_type, title: i.title, active: i.active }
      else
        nil
      end
    end.compact

    @platforms, @layers = layers_row.partition { |i| i[:layer_type] == 'platform' }
    @layers << { img: img_url, menuindex: args[:store].menuindex, params: args[:store].game_img_params || {}, :layer_type=>"img", active: true }
    @layers.sort_by! { |layer| layer[:menuindex] }

    if @platforms.present? && !@product
      platform = make_platform
      @layers << platform if platform.present?
    end

    slogan = { title: args[:address].slogan, params: args[:address].slogan_params || {}, active: 1 }
    if args[:address].image.attached?
      blob                = args[:address].image.blob
      raw_path            = blob.key.scan(/.{2}/)[0..1].join('/')
      slogan[:img]        = "./storage/#{raw_path}/#{blob.key}"
      slogan[:layer_type] = 'img' if blob[:content_type].match?(/image/)
    end
    slogan[:layer_type] = 'text' unless slogan[:layer_type]
    @layers << slogan

    #@new_image = Magick::Image.new(width, height)
  end

  def add_watermarks
    @layers.each_with_index do |layer, idx|
      next if !layer[:active] || (@product && layer[:layer_type] == 'flag')

      layer[:params] = layer[:params].is_a?(Hash) ? layer[:params] : eval(layer[:params]).transform_keys { |key| key.to_s }
      if layer[:layer_type] == 'text'
        add_text(layer)
      else
        add_img(layer, idx)
      end
    end

    @new_image
  end

  private

  def add_img(layer, idx)
    return if layer[:layer_type] == 'flag' && @game.rus_screen == false && @game.rus_voice == false

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

    return unless layer[:title].present?

    params               = layer[:params]
    text_obj             = Magick::Draw.new
    text_obj.font        = layer[:img] || @main_font # || params['font']
    text_obj.pointsize   = params['pointsize'] || 42  # Размер шрифта
    text_obj.fill        = params['fill'] || 'white'
    text_obj.stroke      = params['stroke'] || 'white'   # Цвет обводки текста
    text_obj.gravity     = Magick::LeftGravity  if params[:center]
    text_obj.annotate(@new_image, params['row'] || 0, params['column'] || 0,
                      params['pos_x'] || 0, params['pos_y'] || 0, layer[:title])
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
end
