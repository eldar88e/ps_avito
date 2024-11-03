class JobsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_settings, only: [:update_img, :update_store_test_img]

  def update_store_test_img
    store = current_user.stores.active.includes(:addresses).find_by(id: params[:store_id])
    game  = Game.order(:top).first

    directory_path = Rails.root.join('app', 'assets', 'images', "img_#{store.id}")
    FileUtils.rm_rf(directory_path)
    FileUtils.mkdir_p(directory_path)

    store.addresses.each do |address|
      w_service = WatermarkService.new(store: store, address: address, settings: @settings, game: game)
      next unless w_service.image

      image    = w_service.add_watermarks
      img_path = File.join(directory_path, "#{store.id}_#{address.id}.jpg")
      save_image(image, img_path)
    end
    redirect_to store_path(store), alert: 'Images updated!'
  end

  def update_img
    store  = current_user.stores.active.find_by(id: params[:store_id])
    models = []
    models << Game if params[:game]
    models << Product if params[:product] || current_user.products.active.exists?

    clean  = !!params[:clean]
    all    = !!params[:product]
    notify = !params[:product]

    models.each do |model|
      AddWatermarkJob.perform_later(
        user: current_user,
        notify: notify,
        model: model,
        store: store,
        clean: clean,
        address_id: params[:address_id],
        all: all,
        settings: @settings
      )
    end
    msg = "Фоновая задача по #{clean ? 'пересозданию' : 'созданию'} картинок для #{models.join(', ')} успешно запущена."
    render turbo_stream: success_notice(msg)
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
    store = current_user.stores.active.find_by(id: params[:store_id])
    if store && Avito::CheckErrorsJob.perform_later(store: store)
      render turbo_stream: success_notice(t('jobs_controller.update_ban_list.success', name: store.manager_name))
    else
      error_notice(t('jobs_controller.update_ban_list.error', name: store.manager_name))
    end
  end

  private

  def set_settings
    settings  = current_user.settings
    @settings = settings.pluck(:var, :value).map { |var, value| [var.to_sym, value] }.to_h
    if (main_font_setting = settings.find_by(var: 'main_font'))
      if (blob = main_font_setting.font&.blob)
        raw_path = blob.key.scan(/.{2}/)[0..1].join('/')
        @settings[:main_font] = "./storage/#{raw_path}/#{blob.key}"
      end
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
