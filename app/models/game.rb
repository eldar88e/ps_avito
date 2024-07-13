class Game < ApplicationRecord
  has_many_attached :images, dependent: :destroy
  has_one :game_black_list, foreign_key: 'game_id', primary_key: 'sony_id'

  def self.ransackable_attributes(auth_object = nil)
    %w[name sony_id]
  end

  def self.ransackable_associations(auth_object = nil)
    []
  end
end
