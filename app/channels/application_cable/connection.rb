module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      logger.add_tags 'ActionCable', current_user&.email
    end

    protected

    def find_verified_user
      if verified_user = User.first  # env['warden'].user TODO find a solution for authentication for job and rails
        verified_user || reject_unauthorized_connection
      else
        reject_unauthorized_connection
      end
    end
  end
end
