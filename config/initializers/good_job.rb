Rails.application.configure do
  config.good_job.execution_mode = :external
  config.good_job.queues = 'default:5'
  config.good_job.enable_cron = true
  config.good_job.smaller_number_is_higher_priority = true
  config.good_job.time_zone = 'Europe/Moscow'

  # Cron jobs
  all = {
    update_feed: {
      cron: "0 1 29 2 *",
      kwargs: { user_id: ENV.fetch("USER_ID") { 1 }.to_i },
      class: "MainPopulateJob",
      set: { priority: 10 }, # additional ActiveJob properties; can also be a lambda/proc e.g. `-> { { priority: [1,2].sample } }`
      description: "Populate the Google Sheet for the Avito."
    },
    download_images: {
      cron: "0 2 29 2 *",
      class: "GameImageDownloaderJob",
      kwargs: { user_id: ENV.fetch("USER_ID") { 1 }.to_i },
      set: { priority: 10 },
      description: "Download all game images."
    },
    update_excel: {
      cron: "0 3 29 2 *",
      class: "WatermarksSheetsJob",
      kwargs: { user_id: ENV.fetch("USER_ID") { 1 }.to_i },
      set: { priority: 10 },
      description: "Update all excel files with replacing all images"
    },
    clean_tables: {
      cron: "30 3 29 2 *",
      class: "CleanAttachBlobJob",
      set: { priority: 10 },
      description: "Clean up tables of deleted images on local disk."
    },
    clean_del_stores: {
      cron: "0 4 29 2 *",
      class: "PurgeDeletedStoreImgJob",
      set: { priority: 10 },
      description: "Purge deleted stores and addresses images"
    }
  }

  production = {
    clean_images: {
      cron: "0 0 1 * *",
      class: "CleanUnattachedBlobsJob",
      set: { priority: 10 },
      description: "Clean up unattached blobs and images."
    },
    check_avito: {
      cron: "30 8-23 * * *",
      class: "CheckAvitoShedulesJob",
      set: { priority: 10 },
      #args: [42, "life"],
      kwargs: { user_id: 1 },
      description: "Notice for problem avito account"
    },
    update_ban_list: {
      cron: "0 8 * * 1",
      class: "UpdateBanListJob",
      set: { priority: 10 },
      kwargs: { user_id: 1 },
      description: "Update ban list from avito report"
    }
  }

  config.good_job.cron = Rails.env.production? ? all.merge(production) : all
end
