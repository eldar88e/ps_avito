Rails.application.configure do
  TELEGRAM_BOT_TOKEN = ENV.fetch("TELEGRAM_BOT_TOKEN")
end