class Avito::CheckSchedulesJob < ApplicationJob
  queue_as :default

  def perform(**args)
    current_user = User.find args[:user_id]
    stores       = current_user.stores.active
    stores.each do |store|
      avito = AvitoService.new(store: store)

      if avito.token_status == 403
        TelegramService.call(current_user,"‼️Доступ запрещён. Возможно аккаунт #{store.manager_name} заблокирован")
      end

      response = avito.connect_to('https://api.avito.ru/autoload/v1/profile')
      next if response&.status != 200

      auto_load = JSON.parse(response.body)
      weekdays  = auto_load['schedule'][0]['weekdays']
      if weekdays.size > 1
        TelegramService.call(current_user, "‼️#{store.manager_name} указанно более двух дней для автозагрузки.")
      end

      time = auto_load['schedule'][0]['time_slots']
      if time.size > 1
        TelegramService.call(current_user,
                             "‼️#{store.manager_name} указано более одного временного интервала для автозагрузки.")
      end
    end

    nil
  end
end
