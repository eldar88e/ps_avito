class CleanUnattachedBlobsJob < ApplicationJob
  queue_as :default

  def perform
    unattached_blobs = ActiveStorage::Blob.unattached
    size = unattached_blobs.size
    unattached_blobs.each(&:purge)
    TelegramService.new("⚠️ Cleared #{size} unattached blobs and images.").report
  end
end
