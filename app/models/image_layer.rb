class ImageLayer < ApplicationRecord
  has_one_attached :layer, dependent: :destroy
  belongs_to :store

  validate :check_img_title, on: [:update, :create]

  enum layer_type: [:img, :platform, :text, :flag]

  before_save :set_default_menuindex, :set_default_layer_params

  private

  def set_default_menuindex
    return if menuindex.present?

    max_menuindex  = ImageLayer.maximum(:menuindex)
    self.menuindex = max_menuindex ? max_menuindex + 1 : 1
  end

  def set_default_layer_params
    self.layer_params = {} if layer_params.blank?
  end

  def check_img_title
    if layer.blank? && title.blank?
      errors.add(:base, 'Должна быть указана картинка или текст слоя!')
    end
  end
end
