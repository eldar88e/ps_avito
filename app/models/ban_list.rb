class BanList < ApplicationRecord
  validates :store, presence: true
  validates :ad_id, presence: true
  validates :expires_at, presence: true

  belongs_to :store

  scope :active, -> { where('expires_at > ?', Time.current) }
end
