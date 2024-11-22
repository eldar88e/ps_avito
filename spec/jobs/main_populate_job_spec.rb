require 'rails_helper'

RSpec.describe MainPopulateJob, type: :job do
  let!(:game) { create(:game) }
  let!(:game_deleted) { create(:game, name: 'Deleted Game', deleted: 1, sony_id: 356) }
  let(:user) { create(:user) }
  let(:store) { create(:store, user:) }
  let!(:image_layer) { create(:image_layer, store:) }
  let(:moscow) { create(:address, store:) }
  let(:piter) { create(:address, :piter, store:) }
  let!(:street_moscow) { create(:street, address: moscow) }
  let!(:street_piter) { create(:street, :piter, address: piter) }

  let(:store_not_active) { create(:store, user:, var: 'not_active', contact_phone: 12_345, active: false) }
  let!(:image_layer_not_active) { create(:image_layer, store: store_not_active, active: false) }
  let(:address_not_active) { create(:address, store: store_not_active, active: false) }
  let!(:street_not_active) { create(:street, address: address_not_active) }

  let(:address_not_active_two) { create(:address, :kazan, store:, active: false) }
  let!(:street_not_active_two) { create(:street, :kazan, address: address_not_active_two) }
  let!(:image_layer_not_active_two) { create(:image_layer, store:, active: false) }

  let(:games) do
    [
      { sony_id: '123', name: 'Game 1', rus_voice: false, rus_screen: false, price_tl: 2500, top: 1, price: 1, platform: 'PS5' },
      { sony_id: '456', name: 'Game 2', rus_voice: false, rus_screen: true, price_tl: 2000, top: 1, price: 1, platform: 'PS4' }
    ]
  end

  describe '#perform' do
    context 'when new_games are present' do
      before do
        allow_any_instance_of(TopGamesJob).to receive(:fetch_games).and_return(games)
        allow_any_instance_of(GameImageDownloaderJob).to receive(:fetch_img) do
          file_path = Rails.root.join('spec/fixtures/files/game2.jpg')
          File.read(file_path)
        end
        described_class.perform_now(user:)
      end

      it 'processes games and updates the database' do
        expect(Game.exists?(sony_id: 123, name: 'Game 1')).to be(true)
        expect(Game.exists?(sony_id: 456, name: 'Game 2')).to be(true)
        expect(Game.exists?(sony_id: game_deleted.sony_id, deleted: 1)).to be(true)
        expect(Game.all.size).to eq(3)
      end

      it 'ensures the last game has the status finish' do
        expect(Run.status).to eq('finish')
      end

      it 'updated price' do
        game = Game.find_by(sony_id: 123)
        expect(game.price_updated).to eq(Run.last.id)
      end

      it 'downloads and attaches the image to the game' do
        game = Game.find_by(sony_id: 123)
        expect(game.price_updated).to eq(Run.last.id)
        expect(game.image.attached?).to be(true)
        expect(game.image.record_type).to eq('Game')
        expect(game.image.name).to eq('image')
        expect(game.image.blob.byte_size).to be > 0
        expect(game.image.blob.filename).to eq('sample_image.jpg')
        expect(game.image.blob.content_type).to eq('image/jpeg')
      end

      it 'downloads and attaches the image to the second game' do
        game_two = Game.find_by(sony_id: 456)
        expect(game.image.attached?).to be(true)
        expect(game_two.image.blob.filename).to eq('456_1080.jpg')
        expect(game_two.image.blob.content_type).to eq('image/jpeg')
      end

      it 'downloads and attaches the image for ads' do
        expect(Ad.exists?(full_address: 'Санкт-Петербург, Невский пр., 23')).to be(true)
        expect(Ad.all.size).to eq(4)
        ad = Ad.find_by(full_address: 'Москва, ул. Спартаковская, 24')
        expect(ad.image.attached?).to be(true)
        expect(ActiveStorage::Attachment.where(record_type: 'Ad').size).to eq(4)
        expect(File.exist?(ActiveStorage::Blob.service.path_for(ad.image.blob.key))).to be(true)
      end
    end
  end
end
