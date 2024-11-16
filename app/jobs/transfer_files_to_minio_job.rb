class TransferFilesToMinioJob < ApplicationJob
  queue_as :default

  def perform
    transfer(Game, :name)
    transfer(Product, :title)
    transfer(Ad, :file_id)
  end

  private

  def transfer(klass=Game, column)
    klass.all.each do |item|
      next if !item.image.attached? || item.image.blob.service_name != 'local'

      local_file = item.image.download
      item.image.attach(
        io: StringIO.new(local_file),
        filename: item.image.filename.to_s,
        content_type: item.image.content_type
      )
      Rails.logger.info "File for #{klass} #{item.send(column)} successfully transferred to MinIO."
    rescue => e
      Rails.logger.error "Failed to transfer file for #{klass} #{item.send(column)}: #{e.message}"
    end
    nil
  end
end
