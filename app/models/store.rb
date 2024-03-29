class Store < ApplicationRecord
  validates :var, presence: true, uniqueness: true
  validates :category, presence: true
  validates :goods_type, presence: true
  validates :ad_type, presence: true
  validates :description, presence: true
  validates :condition, presence: true
  validates :allow_email, presence: true
  validates :manager_name, presence: true
  validates :contact_phone, presence: true, uniqueness: true

  has_many :image_layers, dependent: :destroy
  has_many :addresses, dependent: :destroy

  before_save :set_default_layer_params, :cleanup_description

  private

  def set_default_layer_params
    game_img_params = {} unless game_img_params.present?
  end

  def cleanup_description
    if description.present?
      description.squeeze!(' ')
      description.chomp!
    end
  end
end
