class Setting < ApplicationRecord
  validates :var, presence: true, uniqueness: { scope: :user_id }
  validates :value, presence: true

  has_one_attached :font, dependent: :destroy, service: :local

  belongs_to :user
end
