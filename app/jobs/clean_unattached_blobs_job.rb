class CleanUnattachedBlobsJob < ApplicationJob
  queue_as :default

  def perform
    unattached_blobs = ActiveStorage::Blob.unattached
    unattached_blobs.each(&:purge)

    Rails.logger.info "⚠️ Cleared #{unattached_blobs.size} unattached blobs and images."
  end
end
