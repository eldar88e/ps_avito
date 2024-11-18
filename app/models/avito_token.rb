class AvitoToken < ApplicationRecord
  validates :access_token, presence: true
  validates :expires_in, presence: true

  belongs_to :store

  scope :latest_valid, -> { where('created_at + (expires_in * interval \'1 second\') > ?', Time.current) }
end
