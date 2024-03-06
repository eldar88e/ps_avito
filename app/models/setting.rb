class Setting < ApplicationRecord
  validates :var, presence: true, uniqueness: true
  validates :value, presence: true
end
