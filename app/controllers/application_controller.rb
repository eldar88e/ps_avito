class ApplicationController < ActionController::Base
  include Pagy::Backend
  helper_method :noimage_url
  before_action :set_search

  def error_notice(msg, status = :unprocessable_entity)
    render turbo_stream: send_notice(msg, 'danger'), status:
  end

  def success_notice(msg)
    send_notice(msg, 'success')
  end

  def noimage_url
    ActionController::Base.helpers.image_path('noimage.png')
  end

  private

  def set_store
    return cache_store if params[:store_id]

    @store = current_user.stores.find(params[:id])
    Rails.cache.write("user_#{current_user.id}_store_#{params[:id]}", @store, expires_in: 6.hours)
  end

  def cache_store
    @store = Rails.cache.fetch("user_#{current_user.id}_store_#{params[:store_id]}", expires_in: 6.hours) do
      current_user.stores.find(params[:store_id])
    end
  end

  def set_search_ads
    @q_ads = @store.ads.includes(image_attachment: :blob).order(created_at: :desc).ransack(params[:q])
  end

  def set_search
    games = Game.order(:top).includes(:game_black_list, image_attachment: :blob)
    @q    = params[:q] ? games.ransack(params[:q]) : games.active.ransack(params[:q])
  end

  def send_notice(msg, key)
    turbo_stream.append(:notices, partial: 'notices/notice', locals: { notices: msg, key: })
  end
end
