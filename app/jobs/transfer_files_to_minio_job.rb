# Run Example TransferFilesToMinioJob.perform_now(user: User.first, klass: Ad, column: :image, limit: 2000)

class TransferFilesToMinioJob < ApplicationJob
  queue_as :default

  def perform(**args)
    klass = args[:klass].capitalize.constantize
    items = fetch_items(klass, args[:column], args[:limit])
    count = transfer(items, klass)
    user  = find_user(args)
    msg   = "Exported to MinIO #{count} attachments"
    TelegramService.call(user, msg)
    Clean::CleanUnattachedBlobsJob.perform_later(user: user)
  end

  private

  def fetch_items(klass, column, limit = nil)
    klass.includes("#{column}_attachment" => :blob)
         .where(active_storage_blobs: { service_name: 'local' })
         .limit(limit)
  end

  def transfer(items, klass)
    count = 0
    items.find_each do |item| # get default 1000 items
      next unless item.image.attached?

      local_file = item.image.download
      save_attachment(item, local_file)
      count += 1
    rescue StandardError => e
      Rails.logger.error "Failed to transfer file for #{klass}: #{item.id}: #{e.message}"
    end
    count
  end

  def save_attachment(item, local_file)
    item.image.attach(
      io: StringIO.new(local_file),
      filename: item.image.filename.to_s,
      content_type: item.image.content_type
    )
  end
end
