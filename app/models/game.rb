class Game < ApplicationRecord
  validates :name, presence: true
  validates :sony_id, presence: true

  has_one_attached :image, dependent: :purge
  has_many :ads, as: :adable, dependent: :destroy
  has_one :game_black_list, primary_key: 'sony_id'

  scope :active, -> { where(deleted: 0) }
  scope :deleted_not_updated_last_two_months, -> { where(deleted: 1).where(updated_at: ...2.months.ago) }

  def self.ransackable_attributes(_auth_object = nil)
    %w[name sony_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    []
  end
end
