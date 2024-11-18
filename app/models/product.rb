class Product < ApplicationRecord
  PRESENCE_ATTR = %i[ad_status category goods_type ad_type condition allow_email].freeze

  before_validation :set_defaults
  before_save :cleanup_description

  validates :title, presence: true
  validates :description, presence: true
  validates :price, presence: true, numericality: { only_integer: true }

  has_one_attached :image, dependent: :purge
  has_many :ads, as: :adable, dependent: :destroy
  belongs_to :user

  self.inheritance_column = :type_

  scope :active, -> { where(active: true) }

  private

  def set_defaults
    PRESENCE_ATTR.each { |attr| self[attr] = self[attr].presence }
  end

  def cleanup_description
    description.presence&.squeeze(' ')&.strip
  end
end
