class Setting < ApplicationRecord
  validates :var, presence: true, uniqueness: { scope: :user_id },
            format: { with: /\A[a-z_]+\z/, message: "может содержать только маленькие латинские буквы и символ подчеркивания" }
  validates :value, presence: true

  has_one_attached :font, dependent: :purge, service: :local

  belongs_to :user
end
