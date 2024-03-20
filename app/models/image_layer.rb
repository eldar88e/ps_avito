class ImageLayer < ApplicationRecord
  has_one_attached :layer, dependent: :destroy
  belongs_to :store

  enum layer_type: [:img, :platform, :text]

  before_save :set_default_menuindex

  private

  def set_default_menuindex
    return if menuindex

    max_menuindex  = ImageLayer.max(:menuindex)
    self.menuindex = max_menuindex ? max_menuindex + 1 : 1
  end
end
