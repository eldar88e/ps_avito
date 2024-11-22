# frozen_string_literal: true

FactoryBot.define do
  factory :image_layer do
    title { 'Wallpaper' }
    active { true }
    menuindex { 0 }
    layer_params { '' }
    layer_type { :img }
    store { build(:store) }

    after(:build) do |image_layer|
      file_path = Rails.root.join('spec/fixtures/files/wallpaper.jpg')
      image_layer.layer.attach(
        io: File.open(file_path),
        filename: 'wallpaper.jpg',
        content_type: 'image/jpeg'
      )
    end
  end
end
