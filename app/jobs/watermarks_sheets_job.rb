class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user     = find_user(args)
    stores   = args[:store] || user.stores.includes(:addresses).where(active: true, addresses: { active: true })
    set_row  = user.settings
    settings = set_row.pluck(:var, :value).to_h { |var, value| [var.to_sym, value] }
    find_main_font(settings, set_row)

    [stores].flatten.each do |store|
      [Game, Product].each do |model|
        AddWatermarkJob.perform_now(user: args[:user], model:, store:, settings:, clean: args[:clean])
      end
      PopulateExcelJob.perform_now(store:)
    end

    nil
  end

  def find_main_font(settings, set_row)
    blob = set_row.find_by(var: 'main_font')&.font&.blob
    return unless blob

    raw_path = blob.key.scan(/.{2}/)[0..1].join('/')
    settings[:main_font] = "./storage/#{raw_path}/#{blob.key}"
  end
end
