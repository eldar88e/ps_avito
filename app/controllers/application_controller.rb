class ApplicationController < ActionController::Base
  include Pagy::Backend

  before_action :set_search

  def error_notice(msg)
    render turbo_stream: send_notice(msg, 'danger')
  end

  def success_notice(msg)
    send_notice(msg, 'success')
  end

  private

  def set_search
    @q = Game.order(:top).ransack(params[:q])
  end

  def send_notice(msg, key)
    turbo_stream.append(:notices, partial: 'notices/notice', locals: { notices: msg, key: key })
  end
end
