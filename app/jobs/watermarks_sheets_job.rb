class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    user     = find_user(args)
    stores   = args[:store] || user.stores.includes(:addresses).where(active: true, addresses: { active: true })
    set_row  = user.settings
    settings = set_row.pluck(:var, :value).map { |var, value| [var.to_sym, value] }.to_h
    if (blob = set_row.find_by(var: 'main_font')&.font&.blob)
      raw_path = blob.key.scan(/.{2}/)[0..1].join('/')
      settings[:main_font] = "./storage/#{raw_path}/#{blob.key}"
    end

    [stores].flatten.each do |store|
      [Game, Product ].each do |model|
        AddWatermarkJob.perform_now(user: args[:user], model: model, store: store,
                                    settings: settings, clean: args[:clean])
      end
      PopulateExcelJob.perform_now(store: store)
    end

    nil
  end
end
