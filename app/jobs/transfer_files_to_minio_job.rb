class TransferFilesToMinioJob < ApplicationJob
  queue_as :default

  def perform(**args)
    items = fetch_items(args[:klass], args[:column], args[:limit])
    transfer(items, args[:klass], args[:title])
  end

  private

  def fetch_items(klass, column, limit = nil)
    klass.includes("#{column}_attachment" => :blob)
         .where(active_storage_blobs: { service_name: 'local' })
         .limit(limit)
  end

  def transfer(items, klass, title)
    items.find_each do |item| # get default 1000 items
      next unless item.image.attached?

      local_file = item.image.download
      save_attachment(item, local_file)
      Rails.logger.info "File for #{klass}: #{item.send(title)} successfully transferred to MinIO."
    rescue StandardError => e
      Rails.logger.error "Failed to transfer file for #{klass}: #{item.id} #{item.send(title)}: #{e.message}"
    end
    nil
  end

  def save_attachment(item, local_file)
    item.image.attach(
      io: StringIO.new(local_file),
      filename: item.image.filename.to_s,
      content_type: item.image.content_type
    )
  end
end
