if Rails.env == 'development'
  Setting.create(var: 'game_img_size', value: 1080)
  Setting.create(var: 'telegram_chat_id', value: 123)
  Setting.create(var: 'quantity_games', value: 10)

  User.create(email: 'test@test.tt', password: 12345678)

  Store.create(
    var: 'open_ps',
    category: 'Test',
    goods_type: 'Под тест',
    ad_type: 'Продаю свое',
    address: 'Планета Земля',
    description: 'Hello world!',
    condition: 'Новое',
    allow_email: 'Нет',
    manager_name: 'Development',
    contact_phone: 79780001133
  )

  Product.create(
    title: 'Подписка',
    description: 'Подписка Hello world!',
    price: 5000,
    category: 'Test',
    goods_type: 'Под тест',
  )

  puts "Seed done!"
end