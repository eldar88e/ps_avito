class CheckAvitoShedulesJob < ApplicationJob
  queue_as :default

  def perform(**args)
    current_user = User.find args[:user_id]
    stores = current_user.stores
    stores.each do |store|
      avito    = AvitoService.new(store: store)
      response = avito.connect_to('https://api.avito.ru/autoload/v1/profile')
      next if response&.status != 200

      auto_load = JSON.parse(response.body)
      weekdays = auto_load['schedule'][0]['weekdays']
      if weekdays.size > 1
        TelegramService.call("‼️#{store.manager_name} указанно более двух дней для автозагрузки.")
      end

      time = auto_load['schedule'][0]['time_slots']
      if time.size > 1
        TelegramService.call("‼️#{store.manager_name} указано более одного временного интервала.")
      end
    end
  end
end
