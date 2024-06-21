class AvitoToken < ApplicationRecord
  validates :access_token, presence: true
  validates :expires_in, presence: true

  belongs_to :store
end
