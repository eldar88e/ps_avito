class ExampleImageService
  def initialize(store)
    @store = store
  end

  def self.call(store)
    new(store).assemble
  end

  def assemble
    game      = Game.active.order(:top).first
    address   = store.addresses.active.first
    w_service = WatermarkService.new(store: @store, address:, settings: @settings, game:)
    return unless w_service.image_exist?

    image = w_service.add_watermarks
    save_image(game, image)

    # TODO: Доделать метод для тестового рендеринга картики
  end

  private

  def save_image(model, image)
    Tempfile.open(%w[image .jpg]) do |temp_img|
      image.write(temp_img.path)
      temp_img.flush
      model.test_img.attach(io: File.open(temp_img.path), filename: 'test.jpg', content_type: 'image/jpeg')
    end
  end
end
