class Address < ApplicationRecord
  has_one_attached :image, dependent: :destroy
  belongs_to :store

  validates :store_address, presence: true
end
