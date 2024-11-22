class Setting < ApplicationRecord
  validates :var, presence: true, uniqueness: { scope: :user },
                  format: { with: /\A[a-z_]+\z/, message: I18n.t('setting.attributes.var.format') }
  validates :value, presence: true

  has_one_attached :font, dependent: :purge, service: (Rails.env.test? ? :test : :local)

  belongs_to :user
end
