namespace :good_job do
  desc "Clear all jobs from the GoodJob queue"
  task clear: :environment do
    GoodJob::Job.delete_all
    puts "All jobs have been cleared."
  end
end