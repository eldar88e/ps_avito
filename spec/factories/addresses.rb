FactoryBot.define do
  factory :address do
    city { 'Москва' }
    active { true }
    slogan { 'НЕ ПРОДАЕМ ДИСКИ! ЦИФРОВАЯ ВЕРСИЯ!' }
    slogan_params { '{ row: 300, pos_x: 900, pos_y: 120, column: 100 }' }
    total_games { 500 }
    description { 'Игры оформляются дистанционно, это не диски! Цифровая версия!' }
    store { build(:store) }
  end
end
