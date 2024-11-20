# Job to clean attachments and blobs without files on storage
# TODO: возможно нужно сделать проверку на сущ. аттач в s3

module Clean
  class CleanAttachBlobJob < ApplicationJob
    queue_as :default

    def perform(**args)
      attachments = ActiveStorage::Attachment.all
      count       = 0
      attachments.each do |attach|
        next if attach.blob.service_name != 'local'

        key      = attach.blob.key
        raw_path = key.scan(/.{2}/)[0..1].join('/')
        img_path = "./storage/#{raw_path}/#{key}"
        attach.purge && count += 1 unless File.exist?(img_path)
      end
      notify(args, count)
    end

    private

    def notify(args, count)
      msg  = "⚠️ Cleared #{count} rows in tables(attachments and blobs) with missing files."
      user = find_user(args)
      broadcast_notify(msg)
      TelegramService.call(user, msg) if count.positive?
    end
  end
end
