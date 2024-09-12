class Game < ApplicationRecord
  validates :name, presence: true
  validates :sony_id, presence: true

  has_one_attached :image, dependent: :destroy
  has_many :ads, as: :adable
  has_one :game_black_list, foreign_key: 'game_id', primary_key: 'sony_id'

  def self.ransackable_attributes(auth_object = nil)
    %w[name sony_id]
  end

  def self.ransackable_associations(auth_object = nil)
    []
  end
end
