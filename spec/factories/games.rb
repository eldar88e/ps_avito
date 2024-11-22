FactoryBot.define do
  factory :game do
    name { 'Game 1' }
    sony_id { 123 }
    rus_voice { true }
    rus_screen { true }
    price_tl { 1500 }
    top { 1 }
    price { 1 }
    platform { 'PS5' }
    run_id { 1 }
    touched_run_id { 1 }
    md5_hash { '73782ae58bfc0a4aa2419dfdcd090df5' }

    after(:build) do |game|
      file_path = Rails.root.join('spec/fixtures/files/game1.jpg')
      game.image.attach(io: File.open(file_path), filename: 'sample_image.jpg', content_type: 'image/jpeg')
    end
  end
end
