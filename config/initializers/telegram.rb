Rails.application.configure do
  TELEGRAM_BOT_TOKEN = ENV.fetch("TELEGRAM_BOT_TOKEN")
  TELEGRAM_CHAT_ID = ENV.fetch("TELEGRAM_CHAT_ID")
end