class GameBlackList < ApplicationRecord
  belongs_to :game, primary_key: 'sony_id'

  validates :comment, presence: true
end
