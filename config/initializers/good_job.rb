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
    clean: {
      cron: "0 4 29 2 *",
      class: "Clean::MainCleanerJob",
      kwargs: { user_id: ENV.fetch("USER_ID") { 1 }.to_i },
      set: { priority: 10 },
      description: "Job on cleaning unnecessary files, blobs, and attachments"
    }
  }

  production = {
    update_feed: {
      cron: "30 10,19 * * *",
      kwargs: { user_id: ENV.fetch("USER_ID") { 1 }.to_i },
      class: "MainPopulateJob",
      set: { priority: 10 }, # additional ActiveJob properties; can also be a lambda/proc e.g. `-> { { priority: [1,2].sample } }`
      description: "Populate the Google Sheet for the Avito."
    },
    check_avito_shedules: {
      cron: "30 8-23 * * *",
      class: "Avito::CheckSchedulesJob",
      set: { priority: 10 },
      #args: [42, "life"],
      kwargs: { user_id: ENV.fetch("USER_ID") { 1 }.to_i },
      description: "Check store schedules in avito"
    },
    check_avito_errors: {
      cron: "0 18 * * *",
      class: "Avito::CheckErrorsJob",
      set: { priority: 10 },
      kwargs: { user_id: ENV.fetch("USER_ID") { 1 }.to_i },
      description: "Check errors in the last report"
    }
  }

  config.good_job.cron = Rails.env.production? ? all.merge(production) : all
end
