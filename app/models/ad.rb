class Ad < ApplicationRecord
  validates :file_id, presence: true

  belongs_to :user
  belongs_to :store
  belongs_to :address
  belongs_to :adable, polymorphic: true
  has_one_attached :image

  enum deleted: { active: 0, deleted: 1 }
end