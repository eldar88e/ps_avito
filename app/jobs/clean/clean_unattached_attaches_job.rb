# Job to clean attachments, blobs and file that are not attached

class Clean::CleanUnattachedAttachesJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user         = find_user(args)
    record_types = ActiveStorage::Attachment.distinct.pluck(:record_type)
    record_types.each do |record_type|
      attachments         = ActiveStorage::Attachment.where(record_type:)
      existing_record_ids = record_type.constantize.where(id: attachments.pluck(:record_id)).pluck(:id)
      count               = 0
      attachments.each { |attach| attach.purge && count += 1 unless existing_record_ids.include?(attach.record_id) }
      msg = "⚠️ Cleared #{count} attachments, blocks and files from #{record_type}."
      TelegramService.call(user, msg) if user.present? && count > 0
      # Rails.logger.info msg if count > 0
    end
    nil
  end
end
