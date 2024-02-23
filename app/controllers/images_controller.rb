class ImagesController < ApplicationController
  def show
    filename = params[:filename]
    # Определите путь к изображению на сервере
    image_path = Rails.root.join('public', 'storage', filename)
    # Отправьте файл клиенту
    send_file image_path, type: 'image/jpeg', disposition: 'inline'
  end
end
