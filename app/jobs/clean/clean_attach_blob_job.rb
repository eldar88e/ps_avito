# Job to clean attachments and blobs without files on storage or clean storage items without attachment or blob
# TODO: возможно нужно сделать проверку на сущ. аттач в s3

module Clean
  class CleanAttachBlobJob < ApplicationJob
    queue_as :default

    def perform(**args)
      attachments = ActiveStorage::Attachment.all
      count       = 0
      attachments.each do |attach|
        next if attach.blob.service_name != 'local'

        img_path = attach.blob.service.path_for(attach.blob.key)
        attach.purge && count += 1 unless File.exist?(img_path)
      end
      notify(args, count) if count.positive?
    end

    private

    def notify(args, count)
      msg  = "⚠️ Cleared #{count} rows in tables(attachments and blobs) with missing files."
      user = find_user(args)
      super(user, msg)
    end
  end
end
