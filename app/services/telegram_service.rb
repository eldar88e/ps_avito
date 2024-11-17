require 'telegram/bot'

class TelegramService
  def initialize(user, message)
    @message   = message
    settings   = user.settings.pluck(:var, :value).to_h
    @chat_id   = settings['telegram_chat_id']
    @bot_token = settings['telegram_bot_token']
  end

  def self.call(user = nil, message)
    if user.nil?
      Rails.logger.error("User not specified for #{self.class}")
      return
    end

    new(user, message).report
  end

  def report
    if @message.blank?
      Rails.logger.error 'An empty message has been sent to Telegram!'
      return
    end

    if @chat_id.blank? || @bot_token.blank?
      Rails.logger.error 'Telegram chat ID or bot token not set!'
      return
    end

    tg_send
  end

  private

  def tg_send
    [@chat_id.to_s.split(',')].flatten.each { |id| send_messages_to_user(id) }
    nil
  rescue StandardError => e
    Rails.logger.error e.message
  end

  def escape(text)
    text.gsub(/\[.*?m/, '').gsub(/([-_*\[\]()~>#+=|{}.!])/, '\\\\\1') # delete `
  end

  def send_messages_to_user(user_id)
    message_limit = 4000
    message_count = (@message.size / message_limit) + 1
    Telegram::Bot::Client.run(@bot_token) do |bot|
      message_count.times do
        text_part = next_text_part(message_limit)
        bot.api.send_message(chat_id: user_id, text: escape(text_part), parse_mode: 'MarkdownV2')
      end
    end
  end

  def next_text_part(message_limit)
    splitted_text = @message.chars
    splitted_text = %w[D e v |] + splitted_text if Rails.env.development?
    splitted_text.shift(message_limit).join
  end
end
