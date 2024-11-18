module Clean
  class MainCleanerJob < ApplicationJob
    queue_as :default

    def perform(**args)
      user = find_user(args)
      Clean::CleanUnattachedAttachesJob.perform_now(user:) # удалит attach, blob, file привязанные к удаленным сущностям
      Clean::CleanUnattachedBlobsJob.perform_now(user:)    # удалит blob, file привязанные к удаленным attach
      Clean::CleanStorageJob.perform_now(user:)            # удалит attach, blob без file в local storage
      Clean::CleanAttachBlobJob.perform_now(user:)         # удалит все пустые папки в storage
      msg = '✅ Сleaning job completed successfully.'
      TelegramService.call(user, msg) if user.present?
    end
  end
end
