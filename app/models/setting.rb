class Setting < ApplicationRecord
  validates :var, presence: true, uniqueness: true
  validates :value, presence: true

  has_one_attached :font, dependent: :destroy
end
