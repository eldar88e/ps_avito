class AdsController < ApplicationController
  before_action :authenticate_user!, :set_store
  before_action :set_ad, only: %i[edit update]

  def edit
    render turbo_stream: turbo_stream.update(:main_modal_content, partial: '/ads/form')
  end

  def update
    return unless @ad.update(ad_params)

    render turbo_stream: [
      success_notice('Обявление было успешно обнавлено.'),
      turbo_stream.replace(@ad, partial: '/ads/ads', locals: { ad: @ad }),
      close_modal
    ]
  end

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

  private

  def set_ad
    @ad = Ad.find(params[:id])
  end

  def ad_params
    params.require(:ad).permit(:avito_id, :full_address, :file_id, :banned_until, :banned)
  end

  def close_modal
    turbo_stream.append 'mainModal', <<~JS
        <script>
          if (document.getElementById('mainModal')) {
            document.getElementById('mainModal').classList.remove('show');
            document.getElementById('mainModal').style.display = 'none';
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.querySelector('.modal-backdrop').remove(); }
        </script>
      JS
  end
end
