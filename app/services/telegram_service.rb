require 'telegram/bot'

class TelegramService
  MESSAGE_LIMIT = 4_090

  def initialize(user, message)
    @message   = message
    settings   = user.settings.pluck(:var, :value).to_h
    @chat_id   = settings['telegram_chat_id']
    @bot_token = settings['telegram_bot_token']
  end

  def self.call(user, message)
    return Rails.logger.error("User not specified for #{self.class}") if user.nil?

    new(user, message).report
  end

  def report
    tg_send if @message.present? && credential_exists?
  end

  private

  def credential_exists?
    return true if @chat_id.present? || @bot_token.present?

    Rails.logger.error 'Telegram chat ID or bot token not set!'
    false
  end

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
    message_count = (@message.size / MESSAGE_LIMIT) + 1
    @message      = "‼️Dev\n#{@message}" if Rails.env.development?
    Telegram::Bot::Client.run(@bot_token) do |bot|
      message_count.times do
        text_part = next_text_part
        bot.api.send_message(chat_id: user_id, text: escape(text_part), parse_mode: 'MarkdownV2')
      end
    end
  end

  def next_text_part
    part = @message[0...MESSAGE_LIMIT]
    @message = @message[MESSAGE_LIMIT..] || ''
    part
  end
end
