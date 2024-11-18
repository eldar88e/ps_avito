# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Store, type: :model do
  let!(:store) { create(:store) }

  context 'validations' do
    it { should validate_presence_of(:var) }
    it { should validate_uniqueness_of(:var).scoped_to(:user_id) }
    it { should validate_presence_of(:category) }
    it { should validate_presence_of(:goods_type) }
    it { should validate_presence_of(:ad_type) }
    it { should validate_presence_of(:type) }
    it { should validate_presence_of(:description) }
    it { should validate_presence_of(:condition) }
    it { should validate_presence_of(:allow_email) }
    it { should validate_presence_of(:manager_name) }
    it { should validate_presence_of(:contact_phone) }
    it { should validate_uniqueness_of(:contact_phone).case_insensitive }
  end

  context 'associations' do
    it { should have_many(:image_layers).dependent(:destroy) }
    it { should have_many(:addresses).dependent(:destroy) }
    it { should have_many(:avito_tokens).dependent(:destroy) }
    it { should have_many(:ban_lists).dependent(:destroy) }
    it { should belong_to(:user) }
  end

  describe 'callbacks' do
    let!(:store) { create(:store, game_img_params: '', description: '  Example description  ') }

    it 'sets default game_img_params before save' do
      expect(store.game_img_params).to be_nil
    end

    it 'cleans up description before save' do
      expect(store.description).to eq('Example description')
    end
  end
end
