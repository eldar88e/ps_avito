class AdsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_store, only: [:update_all]
  before_action :set_search_ads, only: [:update_all]

  def update_all
    @store.ads.update_all(banned: false, banned_until: nil)
    # @pagy, @ads = pagy(@q_ads.result, items: 36)
    msg = 'Все объявления были сняты с бана!'
    render turbo_stream: [
      #turbo_stream.replace('ads-block', partial: '/ads/ads_list', locals: { style: 'show active' }),
      success_notice(msg)
    ]
  end
end
