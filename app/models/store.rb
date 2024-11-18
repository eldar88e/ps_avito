class Store < ApplicationRecord
  validates :var, presence: true, uniqueness: { scope: :user }
  validates :category, presence: true
  validates :goods_type, presence: true
  validates :ad_type, presence: true
  validates :type, presence: true
  validates :description, presence: true
  validates :condition, presence: true
  validates :allow_email, presence: true
  validates :manager_name, presence: true
  validates :contact_phone, presence: true, uniqueness: { case_sensitive: false }

  has_many :image_layers, dependent: :destroy
  has_many :addresses, dependent: :destroy
  has_many :avito_tokens, dependent: :destroy
  has_many :ban_lists, dependent: :destroy
  has_many :ads, dependent: :destroy
  has_many :cache_reports, dependent: :destroy

  belongs_to :user

  before_save :set_default_layer_params, :cleanup_description

  self.inheritance_column = :type_

  scope :active, -> { where(active: true) }

  private

  def set_default_layer_params
    game_img_params.present? || self.game_img_params = nil
  end

  def cleanup_description
    return if description.blank?

    description.squeeze!(' ')
    description.strip!
  end
end
