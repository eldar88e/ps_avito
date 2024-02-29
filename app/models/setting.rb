class Setting < ApplicationRecord
  validates :var, presence: true
  validates :value, presence: true
end
