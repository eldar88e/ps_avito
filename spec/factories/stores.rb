FactoryBot.define do
  factory :store do
    var { "store_name" }
    category { "Игры, приставки и программы" }
    goods_type { "Игры для приставок" }
    ad_type { "Товар приобретен на продажу" }
    manager_name { "Store Name" }
    description { "Команда #{manager_name} занимается продажей игр PlayStation" }
    condition { 'Новое' }
    allow_email { 'Нет' }
    contact_phone { '89781222211' }
    game_img_params { '{ pos_x: 224, pos_y: 0, row: 1440, column: 1440 }' }
    menuindex { 0 }
    active { true }
    contact_method { 'В сообщениях' }
    type { 'Другое' }
    user { build(:user) }
  end
end