class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock
  # retry_on ActiveRecord::Deadlocked

  # Most jobs are safe to ignore if the underlying records are no longer available
  # discard_on ActiveJob::DeserializationError

  private

  def current_user(user_id)
    User.find(user_id)
  end

  def find_user(args)
    args[:user] || current_user(args[:user_id])
  end

  def broadcast_notify(message, key='success')
    # Rails.logger.info "Broadcasting message: #{message}"
    Turbo::StreamsChannel.broadcast_append_to(
      :notify,
      target: :notices,
      partial: '/notices/notice',
      locals: { notices: message, key: key }
    )
  end
end
