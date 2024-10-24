class Clean::SaveImageJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user    = args[:user]
    photo   = args[:photo]
    file_id = args[:file_id]
    id      = args[:id]
    ad      = args[:ad]
    product = args[:product]

    image = photo.add_watermarks
    name  = "#{file_id}.jpg"
    save_image(ad, name, image)
  rescue StandardError => e
    msg = "#{product.send(id)} || #{e.message}"
    msg << "\nhttps://store.playstation.com/en-tr/product/#{file_id}" if file_id.match?(/[A-Z]/)
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
