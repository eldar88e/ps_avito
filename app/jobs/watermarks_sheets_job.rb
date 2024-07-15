class WatermarksSheetsJob < ApplicationJob
  queue_as :default

  def perform(**args)
    stores    = args[:user].stores.includes(:addresses).where(active: true, addresses: { active: true })
    settings  = args[:user].settings
    size      = settings.find_by(var: 'game_img_size').value
    blob      = settings.find_by(var: 'main_font').font.blob
    raw_path  = blob.key.scan(/.{2}/)[0..1].join('/')
    main_font = "./storage/#{raw_path}/#{blob.key}"
    stores.each do |store|
      [Game, Product ].each do |model|
        AddWatermarkJob.perform_now(user: args[:user], model: model, store: store, size: size, main_font: main_font, clean: args[:clean])
      end
      #PopulateGoogleSheetsJob.perform_now(site: site)
      PopulateExcelJob.perform_now(store: store)
    end

    nil
  end
end
