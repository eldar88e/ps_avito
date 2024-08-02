class JobsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_settings, only: [:update_img, :update_products_img, :update_store_test_img]

  def update_store_test_img
    store = current_user.stores.includes(:addresses).where(active: true, id: params[:store_id]).first
    game  = Game.order(:top).first

    directory_path = Rails.root.join('app', 'assets', 'images', "img_#{store.id}")
    FileUtils.rm_rf(directory_path)
    FileUtils.mkdir_p(directory_path)

    store.addresses.each do |address|
      w_service = WatermarkService.new(store: store, address: address, settings: @settings,
                                       game: game, main_font: @main_font)
      next unless w_service.image

      image    = w_service.add_watermarks
      img_path = File.join(directory_path, "#{store.id}_#{address.id}.jpg")
      save_image(image, img_path)
    end
    redirect_to store_path(store), alert: 'Images updated!'
  end

  def update_img
    clean = params[:clean]
    store = current_user.stores.find_by(active: true, id: params[:store_id])
    if store
      [Game, Product].each do |model|
        AddWatermarkJob.perform_later(user: current_user, notify: true, model: model, store: store, settings: @settings,
                                      main_font: @main_font, clean: clean, address_id: params[:address_id])
      end
      msg = "Фоновая задача по #{clean ? 'пересозданию' : 'созданию'} картинок успешно запущена."
      render turbo_stream: [success_notice(msg)]
    end
  end

  def update_products_img
    AddWatermarkJob.perform_later(user: current_user, all: true, model: Product, settings: @settings,
                                  main_font: @main_font, clean: params[:clean])
    past = params[:clean] ? 'пересозданию' : 'созданию'
    render turbo_stream: [
      success_notice("Фоновая задача по #{past} картинок для всех объявлений кроме игр успешно запущена.")
    ]
  end

  def update_feed
    store = current_user.stores.find_by(active: true, id: params[:store_id])
    if store && PopulateExcelJob.perform_later(store: store)
      msg = "Фоновая задача по обновлению фида для магазина #{store.manager_name} успешно запущена."
      render turbo_stream: [success_notice(msg)]
    else
      error_notice "Ошибка запуска фоновой задачи по обновлению фида, возможно магазин не активен!"
    end
  end

  def update_ban_list
    store = current_user.stores.find_by(active: true, id: params[:store_id])
    if store && UpdateBanListJob.perform_later(store: store)
      msg = "Фоновая задача по обновлению списка заблокированных объявлений для магазина #{store.manager_name} \
             успешно запущена."
      render turbo_stream: [success_notice(msg)]
    else
      msg = "Ошибка запуска фоновой задачи по обновлению списка заблокированных объявлений для магазина \
             #{store.manager_name}, возможно магазин не активен!"
      error_notice(msg)
    end
  end

  private

  def set_settings
    settings   = current_user.settings
    @settings  = settings.pluck(:var, :value).map { |var, value| [var.to_sym, value] }.to_h
    blob       = settings.find_by(var: 'main_font')&.font&.blob
    @main_font = if blob
                   raw_path = blob.key.scan(/.{2}/)[0..1].join('/')
                   "./storage/#{raw_path}/#{blob.key}"
                 end
  end

  def save_image(image, img_path)
    temp_img = Tempfile.new(%w[image .jpg])
    image.write(temp_img.path)
    temp_img.flush

    File.open(img_path, 'wb') { |file| file.write(temp_img.read) }

    temp_img.close
    temp_img.unlink
  end
end
