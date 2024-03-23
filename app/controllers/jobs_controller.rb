class JobsController < ApplicationController
  before_action :authenticate_user!

  def update_store_test_img
    store = Store.includes(:addresses).where(active: true, id: params[:store_id]).first
    size  = Setting.pluck(:var, :value).to_h['game_img_size']
    game  = Game.order(:top).first

    directory_path = Rails.root.join('app', 'assets', 'images', "img_#{store.id}")
    FileUtils.rm_rf(directory_path)
    FileUtils.mkdir_p(directory_path)

    store.addresses.each do |address|
      w_service = WatermarkService.new(store: store, address: address, size: size, game: game)
      next unless w_service.image

      image    = w_service.add_watermarks
      img_path = File.join(directory_path, "#{store.id}_#{address.id}.jpg")
      save_image(image, img_path)
    end
    redirect_to store_path(store), alert: 'Images updated!'
  end

  def update_img
    clean = params[:clean]
    store = Store.includes(:addresses)
                 .where(active: true, id: params[:store_id], addresses: { active: true, id: params[:address_id] })
                 .first
    address  = store.addresses.first
    settings = Setting.pluck(:var, :value).to_h
    AddWatermarkJob.perform_later(store: store, address: address, settings: settings, clean: clean)
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
