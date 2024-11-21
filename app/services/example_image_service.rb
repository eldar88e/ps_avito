class ExampleImageService
  def initialize(address)
    @store    = address.store
    @address  = address
    @settings = settings
  end

  def self.call(address)
    new(address).assemble
  end

  def assemble
    game      = Game.active.order(:top).first
    w_service = WatermarkService.new(store: @store, address: @address, settings: @settings, game:)
    return unless w_service.image_exist?

    save_image(w_service)
  end

  private

  def save_image(w_service)
    image = w_service.add_watermarks
    Tempfile.open(%w[image .jpg]) do |temp_img|
      image.write(temp_img.path)
      temp_img.flush
      @store.test_img.attach(io: File.open(temp_img.path), filename: 'test.jpg', content_type: 'image/jpeg')
    end
  end

  def settings
    set_row  = @store.user.settings
    settings = set_row.pluck(:var, :value).to_h.transform_keys(&:to_sym)
    find_main_font(settings, set_row)
    settings
  end

  def find_main_font(settings, set_row)
    blob = set_row.find_by(var: 'main_font')&.font&.blob
    return unless blob

    raw_path = blob.key.scan(/.{2}/)[0..1].join('/')
    settings[:main_font] = "./storage/#{raw_path}/#{blob.key}"
  end
end
