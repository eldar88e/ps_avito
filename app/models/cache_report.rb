class CacheReport < ApplicationRecord
  # include Mongoid::Document

  # field :report_id, type: Integer
  # field :store_id, type: Integer
  # field :report, type: Hash
  # field :fees, type: Hash

  # index({ report_id: 1, store_id: 1 }, { unique: true })

  validates :report_id, presence: true
  validates :report, presence: true
  validates :user_id, uniqueness: { scope: [:store_id, :report_id] }

  belongs_to :user
  belongs_to :store
end