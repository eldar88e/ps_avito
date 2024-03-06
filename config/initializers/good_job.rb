Rails.application.configure do
  config.good_job.execution_mode = :external
  config.good_job.queues = 'default:5'
  config.good_job.enable_cron = true
  config.good_job.smaller_number_is_higher_priority = true
  config.good_job.time_zone = 'Europe/Moscow'

  # Cron jobs
  config.good_job.cron = {
    update_feed: {
      cron: "30 10,19 * * *",
      class: "MainPopulateJob",
      set: { priority: 10 }, # additional ActiveJob properties; can also be a lambda/proc e.g. `-> { { priority: [1,2].sample } }`
      description: "Populate the Google Sheet for the Avito."
    },
    clean_images: {
      cron: "0 0 1 * *",
      class: "CleanUnattachedBlobsJob",
      set: { priority: 10 },
      description: "Clean up unattached blobs and images."
    }
  }
end
