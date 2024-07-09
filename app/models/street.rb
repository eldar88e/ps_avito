class Street < ApplicationRecord
  belongs_to :address

  validates :title, presence: true
end