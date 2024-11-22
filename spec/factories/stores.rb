# frozen_string_literal: true

FactoryBot.define do
  factory :store do
    var { 'rspec_test_store' }
    category { 'Игры, приставки и программы' }
    goods_type { 'Игры для приставок' }
    ad_type { 'Товар приобретен на продажу' }
    manager_name { 'Store Rspec' }
    description { 'Команда [manager_name] занимается продажей игр PlayStation' }
    condition { 'Новое' }
    allow_email { 'Нет' }
    contact_phone { '89781222211' }
    game_img_params { '{ pos_x: 224, pos_y: 0, row: 1440, column: 1440 }' }
    menuindex { 0 }
    active { true }
    contact_method { 'В сообщениях' }
    type { 'Другое' }
    desc_game { '[name]<br>Русский голос: [rus_voice]<br>Русское меню и текст: [rus_text]<br>Приставка: [platform]' }
    desc_product { '<div><strong>[name]<br></strong><br></div><div><strong>[desc_product]</strong></div>' }
    percent { 0 }
    user { build(:user) }
  end
end
