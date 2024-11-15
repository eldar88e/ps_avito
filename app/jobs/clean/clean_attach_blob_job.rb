# Job to clean attachments and blobs without files on storage

class Clean::CleanAttachBlobJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user        = find_user(args)
    attachments = ActiveStorage::Attachment.all
    count       = 0
    attachments.each do |attach|
      key      = attach.blob.key
      raw_path = key.scan(/.{2}/)[0..1].join('/') # TODO: уточнить по поводу уровней вложенности
      img_path = "./storage/#{raw_path}/#{key}"
      attach.purge && count += 1 unless File.exist?(img_path)
    end
    msg = "⚠️ Cleared #{count} rows in tables(attachments and blobs) with missing files."
    # Rails.logger.info msg
    TelegramService.call(user, msg) if user.present? && count > 0
  end
end
