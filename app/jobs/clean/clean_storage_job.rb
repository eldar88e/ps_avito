# Job to clean storage from empty folders of unattached items

module Clean
  class CleanStorageJob < ApplicationJob
    queue_as :default

    def perform(**args)
      user         = find_user(args)
      storage_path = Rails.root.join('storage')
      count        = 0
      Dir.glob("#{storage_path}/**/*").reverse_each do |dir_path|
        FileUtils.rmdir(dir_path) && count += 1 if File.directory?(dir_path) && Dir.empty?(dir_path)
      end

      msg = "⚠️ Deleted #{count} empty directory."
      TelegramService.call(user, msg) if count.positive?
    end
  end
end
