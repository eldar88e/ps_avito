class TransferFilesToMinioJob < ApplicationJob
  queue_as :default

  def perform(**args)
    transfer(args[:klass], :name)
  end

  private

  def transfer(klass, column, limit = nil)
    klass.limit(limit).find_each do |item| # get default 1000 items
      next if !item.image.attached? || item.image.blob.service_name != 'local'

      local_file = item.image.download
      item.image.attach(io: StringIO.new(local_file), filename: item.image.filename.to_s,
                        content_type: item.image.content_type)
      Rails.logger.info "File for #{klass} #{item.send(column)} successfully transferred to MinIO."
    rescue StandardError => e
      Rails.logger.error "Failed to transfer file for #{klass} #{item.send(column)}: #{e.message}"
    end
    nil
  end
end
