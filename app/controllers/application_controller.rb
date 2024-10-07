class ApplicationController < ActionController::Base
  include Pagy::Backend
  helper_method :noimage_url
  before_action :set_search

  def error_notice(msg)
    render turbo_stream: send_notice(msg, 'danger')
  end

  def success_notice(msg)
    send_notice(msg, 'success')
  end

  def noimage_url
    ActionController::Base.helpers.image_path('noimage.png')
  end

  private

  def set_search_ads
    @q_ads = @store.ads.order(created_at: :desc).ransack(params[:q])
  end

  def set_search
    @q = Game.order(:top).active.includes(ads: { image_attachment: :blob }).ransack(params[:q])
  end

  def send_notice(msg, key)
    turbo_stream.append(:notices, partial: 'notices/notice', locals: { notices: msg, key: key })
  end
end
