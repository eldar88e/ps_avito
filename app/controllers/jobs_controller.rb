class JobsController < ApplicationController
  before_action :authenticate_user!

  def update_store_test_img
    store     = Store.includes(:addresses).where(active: true, id: params[:store_id]).first
    settings  = Setting.pluck(:var, :value).to_h
    size      = settings['game_img_size']
    blob      = settings['main_font'].font.blob
    raw_path  = blob.key.scan(/.{2}/)[0..1].join('/')
    main_font = "./storage/#{raw_path}/#{blob.key}"
    game  = Game.order(:top).first

    directory_path = Rails.root.join('app', 'assets', 'images', "img_#{store.id}")
    FileUtils.rm_rf(directory_path)
    FileUtils.mkdir_p(directory_path)

    store.addresses.each do |address|
      w_service = WatermarkService.new(store: store, address: address, size: size, game: game, main_font: main_font)
      next unless w_service.image

      image    = w_service.add_watermarks
      img_path = File.join(directory_path, "#{store.id}_#{address.id}.jpg")
      save_image(image, img_path)
    end
    redirect_to store_path(store), alert: 'Images updated!'
  end

  def update_img
    clean     = params[:clean]
    settings  = Setting.all
    size      = settings.find_by(var: 'game_img_size').value
    blob      = settings.find_by(var: 'main_font').font.blob
    raw_path  = blob.key.scan(/.{2}/)[0..1].join('/')
    main_font = "./storage/#{raw_path}/#{blob.key}"
    store = Store.includes(:addresses)
                 .where(active: true, id: params[:store_id], addresses: { active: true, id: params[:address_id] })
                 .first
    if store
      address = store.addresses.first
      [AddWatermarkJob, AddWatermarkOtherJob].each do |klass|
        klass.send(:perform_now, address: address, size: size, main_font: main_font, clean: clean)
      end
      head :ok
    else
      head :unprocessable_entity
    end
  end

  def update_products_img
    clean     = params[:clean]
    settings  = Setting.all
    size      = settings.find_by(var: 'game_img_size').value
    blob      = settings.find_by(var: 'main_font').font.blob
    raw_path  = blob.key.scan(/.{2}/)[0..1].join('/')
    main_font = "./storage/#{raw_path}/#{blob.key}"
    stores = Store.includes(:addresses).where(active: true, addresses: { active: true })
    stores.each do |store|
      store.addresses.each do |address|
        AddWatermarkOtherJob.perform_now(address: address, size: size, main_font: main_font, clean: clean)
      end
    end
    redirect_to '/products'
  end

  def update_feed
    store = Store.find_by(active: true, id: params[:store_id])
    if store && PopulateExcelJob.perform_later(store: store)
      # render js: "document.getElementById('loader').remove();"
      head :ok
    else
      head :unprocessable_entity
    end
  end

  private

  def save_image(image, img_path)
    temp_img = Tempfile.new(%w[image .jpg])
    image.write(temp_img.path)
    temp_img.flush

    File.open(img_path, 'wb') { |file| file.write(temp_img.read) }

    temp_img.close
    temp_img.unlink
  end
end
