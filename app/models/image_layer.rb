class ImageLayer < ApplicationRecord
  has_one_attached :layer, dependent: :purge # , service: (Rails.env.test? ? :test : :local)
  belongs_to :store

  validate :check_img_title, on: %i[update create]

  enum :layer_type, { img: 0, platform: 1, text: 2, flag: 3 }

  before_save :set_default_menuindex, :set_default_layer_params

  scope :active, -> { where(active: true) }

  private

  def set_default_menuindex
    return if menuindex.present?

    max_menuindex  = ImageLayer.maximum(:menuindex)
    self.menuindex = max_menuindex ? max_menuindex + 1 : 1
  end

  def set_default_layer_params
    layer_params.present? || self.layer_params = nil
  end

  def check_img_title
    errors.add(:base, 'Должна быть указана картинка или текст слоя!') if layer.blank? && title.blank?
  end
end
