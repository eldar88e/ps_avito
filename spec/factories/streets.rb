FactoryBot.define do
  factory :street do
    title { 'ул. Спартаковская, 24' }
    address { build(:address) }
  end
end