class Game < ApplicationRecord
  has_many_attached :images, dependent: :destroy
  has_one :game_black_list, foreign_key: 'game_id', primary_key: 'sony_id'
end
