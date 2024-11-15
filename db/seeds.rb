# frozen_string_literal: true

if Rails.env.development?
  user = User.create(email: 'test@test.tt', password: 12_345_678)

  Game.create(name: 'Spider-Man', sony_id: 'EP9000-PPSA08338_00-MARVELSPIDERMAN2', run_id: 1, touched_run_id: 1,
              price: 8600, top: 1, platform: 'PS5', md5_hash: 'a248d22ae9c2')

  user.stores.create(
    var: 'test_ps',
    category: 'Test',
    goods_type: 'Под тест',
    ad_type: 'Продаю свое',
    type: 'Другое',
    description: 'Hello world!',
    condition: 'Новое',
    allow_email: 'Нет',
    manager_name: 'Test Account',
    contact_phone: 79_780_001_133,
    active: true,
    game_img_params: { pos_x: 448, pos_y: 208, row: 1024, column: 1024 }
  )

  streets = [
    ['улица Маршала Федоренко, 2к2', 'улица Академика Волгина, 25к2', 'Рязанский проспект, 63'],
    ['Ленинский проспект, 168', 'Школьная улица, 11'],
    ['улица Александра Невского, 14']
  ]

  user.stores.each do |store|
    %w[Москва Санкт-Петербург Новосибирск].each_with_index do |city, idx|
      address = store.addresses.create(city:, active: true, total_games: [500, 1000].sample)
      streets[idx].each do |street|
        address.streets.create(title: street)
      end
    end

    store.image_layers.create(title: 'TEST PS', active: true,
                              layer_params: '{ pointsize: 64, row: 400, column: 100, pos_x: 448, pos_y: 120 }')
  end

  user.products.create(
    title: 'Подписка',
    description: 'Подписка Hello world!',
    price: 5000,
    category: 'Test',
    goods_type: 'Под тест'
  )

  puts 'Seed done!'
end
