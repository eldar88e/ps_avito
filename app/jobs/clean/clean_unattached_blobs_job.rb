class Clean::CleanUnattachedBlobsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user             = find_user(args)
    unattached_blobs = ActiveStorage::Blob.unattached
    unattached_blobs.each(&:purge)

    msg = "⚠️ Cleared #{unattached_blobs.size} unattached blobs and images."
    # Rails.logger.info msg if unattached_blobs.size > 0
    TelegramService.call(user, msg) if user.present? && unattached_blobs.size > 0
  end
end
