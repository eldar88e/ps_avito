class AdsController < ApplicationController
  before_action :authenticate_user!, :set_store

  def update_all
    @store.ads.update_all(banned: false, banned_until: nil)
    set_search_ads
    @pagy, @ads = pagy(@q_ads.result, items: 36)
    render turbo_stream: [
      # turbo_stream.replace(:ads, partial: '/ads/ads_list'),
      # TODO к ссылкам пагинации пристыковывается update_all /stores/10?page=3
      success_notice(t('.success'))
    ]
  end
end
