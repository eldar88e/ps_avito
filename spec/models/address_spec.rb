require 'rails_helper'

RSpec.describe Address, type: :model do
  let(:address) { create(:address) }

  it { should belong_to(:store) }
  it { should have_many(:streets).dependent(:destroy) }
  it { should have_one_attached(:image) }

  it { should validate_presence_of(:city) }

  describe '#check_slogan_params_blank' do
    context 'when slogan_params is present' do
      it 'does not change slogan_params' do
        address.valid?
      end
    end

    context 'when slogan_params is blank' do
      it 'sets slogan_params to nil' do
        address.slogan_params = ''
        address.valid?
        expect(address.slogan_params).to be_nil
      end
    end
  end

  describe '#store_address' do
    context 'when there is at least one street' do
      let!(:street) { create(:street, address:) }

      it 'returns a string with city and street title' do
        expect(address.store_address).to eq("#{address.city}, #{street.title}")
      end
    end

    context 'when there are no streets' do
      it 'returns nil' do
        expect(address.store_address).to be_nil
      end
    end
  end
end
