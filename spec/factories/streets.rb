# frozen_string_literal: true

FactoryBot.define do
  factory :street do
    title { 'ул. Спартаковская, 24' }
    address { build(:address) }
  end
end
