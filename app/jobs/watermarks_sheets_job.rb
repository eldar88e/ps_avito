class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    stores    = args[:user].stores.includes(:addresses).where(active: true, addresses: { active: true })
    set_row   = args[:user].settings
    settings  = set_row.pluck(:var, :value).map { |var, value| [var.to_sym, value] }.to_h
    blob      = set_row.find_by(var: 'main_font')&.font&.blob
    main_font =
      if blob
        raw_path = blob.key.scan(/.{2}/)[0..1].join('/')
        "./storage/#{raw_path}/#{blob.key}"
      else
        nil
      end

    stores.each do |store|
      [Game, Product ].each do |model|
        AddWatermarkJob.perform_now(user: args[:user], model: model, store: store,
                                    settings: settings, main_font: main_font, clean: args[:clean])
      end
      #PopulateGoogleSheetsJob.perform_now(site: site)
      PopulateExcelJob.perform_now(store: store)
    end

    nil
  end
end
