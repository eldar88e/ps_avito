# frozen_string_literal: true

FactoryBot.define do
  factory :street do
    title { 'ул. Спартаковская, 24' }
    address { build(:address) }

    trait :piter do
      title { 'Невский пр., 23' }
      address { build(:address, :piter) }
    end

    trait :kazan do
      title { 'ул. Баумана, 1' }
      address { build(:address, :kazan) }
    end
  end
end
