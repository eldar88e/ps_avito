class Address < ApplicationRecord
  has_one_attached :image, dependent: :destroy
  belongs_to :store

  validates :store_address, presence: true

  before_validation :check_slogan_params_blank

  private

  def check_slogan_params_blank
    self.slogan_params = {} if slogan_params.blank?
  end
end
