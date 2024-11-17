class SaveImageJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user     = args[:user]
    model    = args[:model]
    store    = args[:store]
    address  = args[:address]
    settings = args[:settings]
    file_id  = args[:file_id]
    id       = args[:id]
    ad       = args[:ad]
    product  = args[:product]

    w_service = WatermarkService.new(store:, address:, settings:, game: product, product: model == Product)
    return Rails.logger.error("Not exist main image for #{@game.name}") unless w_service.image_exist?

    image = w_service.add_watermarks
    name  = "#{file_id}.jpg"
    save_image(ad, name, image)
  rescue StandardError => e
    msg = "Аккаунт: #{store.manager_name}\nID: #{product.send(id)}\nError: #{e.message}"
    msg << "\nТовар: #{product.is_a?(Game) ? product.name : product.title}"
    TelegramService.call(user, msg)
  end

  private

  def save_image(ad, name, image)
    Tempfile.open(%w[image .jpg]) do |temp_img|
      image.write(temp_img.path)
      temp_img.flush
      ad.image.attach(io: File.open(temp_img.path), filename: name, content_type: 'image/jpeg')
    end
  end
end
