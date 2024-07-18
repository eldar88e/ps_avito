class NotifyChannel < ActionCable::Channel::Base
  extend Turbo::Streams::Broadcasts, Turbo::Streams::StreamName
  include Turbo::Streams::StreamName::ClassMethods

  def subscribed
    stream_name = verified_stream_name_from_params
    if stream_name.present? && subscription_allowed?
      stream_from stream_name
    else
      reject
    end
  end

  def subscription_allowed?
    user = User.find_by id: params[:user_id]
    current_user.id == user&.id
  end
end
