class Avito::AutoLoadJob < Avito::BaseApplicationJob
  queue_as :default

  def perform(**args)
    store  = args[:store]
    params = args[:params]
    avito  = args[:avito] || AvitoService.new(store: store)
    return if avito.token_status == 403

    result = avito.connect_to('https://api.avito.ru/autoload/v1/profile', :post, params)

    if result&.status == 200
      Rails.cache.delete("auto_load_#{store.id}")
      broadcast_notify(I18n.t('avito.notice.upd_autoload_conf'))
    else
      broadcast_notify(I18n.t('avito.error.upd_autoload_conf'), 'danger')
    end
  end
end
