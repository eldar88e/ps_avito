class Product < ApplicationRecord
  validates :title, presence: true
  validates :description, presence: true
  validates :price, presence: true
  validates :price, numericality: { only_integer: true }

  has_one_attached :image, dependent: :destroy

  before_save :cleanup_description

  private

  def cleanup_description
    if description.present?
      description.squeeze!(' ')
      description.chomp!
    end
  end
end
