class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user     = find_user(args)
    stores   = args[:store] || user.stores.includes(:addresses).where(active: true, addresses: { active: true })
    settings = fetch_settings(user)
    [stores].flatten.each { |store| process_store(user, store, settings, args[:clean]) }
    nil
  end

  private

  def fetch_settings(user)
    set_row  = user.settings
    settings = set_row.pluck(:var, :value).to_h.transform_keys(&:to_sym)
    find_main_font(settings, set_row)
  end

  def process_store(user, store, settings, clean)
    [Game, Product].each { |model| AddWatermarkJob.perform_now(user:, model:, store:, settings:, clean:) }
    PopulateExcelJob.perform_now(store:)
  end

  def find_main_font(settings, set_row)
    blob = set_row.find_by(var: 'main_font')&.font&.blob
    return unless blob

    raw_path = blob.key.scan(/.{2}/)[0..1].join('/')
    settings[:main_font] = "./storage/#{raw_path}/#{blob.key}"
  end
end
