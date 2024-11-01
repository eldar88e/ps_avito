class Avito::ReviewsController < ApplicationController
  include AvitoConcerns
  before_action :set_store_breadcrumbs, only: [:index]
  before_action :set_stores, only: [:index]
  before_action :set_rate, only: [:index]
  layout 'avito'
  LIMIT = 30

  def index
    @page    = params[:page].to_i
    offset   = @page * LIMIT
    url      = "https://api.avito.ru/ratings/v1/reviews?limit=#{LIMIT}&offset=#{offset}"
    response = fetch_and_parse(url)
    @reviews = response['reviews'] || []
  end

  def edit
    @id = params[:id]
    render turbo_stream: [
      turbo_stream.update(:main_modal_content, partial: 'avito/reviews/form')
    ]
  end

  def update
    url      = 'https://api.avito.ru/ratings/v1/answers'
    payload  = { message: params[:message]&.strip, 'reviewId' => params[:id].to_i }
    response = fetch_and_parse(url, :post, payload)
    return error_notice(response[:error]) if response[:error]

    render turbo_stream: [success_notice('Ответ был успешно отправлен.'), close_modal]
  end

  def destroy
    answer_id = params[:id]
    error_notice('Неверно указан ID ответа.') if answer_id.blank?

    url = "https://api.avito.ru/ratings/v1/answers/#{answer_id}"
    fetch_and_parse(url, :delete)
    msg = 'Ответ был успешно удален.'
    render turbo_stream: success_notice(msg)
  end

  private

  def close_modal
    turbo_stream.append "mainModal", <<~JS
      <script>
        if (document.getElementById('mainModal')) {
          document.getElementById('mainModal').classList.remove('show');
          document.getElementById('mainModal').style.display = 'none';
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.querySelector('.modal-backdrop').remove();
        } else {
          console.warn("Modal element not found");
        }
      </script>
    JS
  end
end
