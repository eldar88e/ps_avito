class GameBlackList < ApplicationRecord
  belongs_to :game, foreign_key: 'game_id', primary_key: 'sony_id'

  validates :comment, presence: true
end
