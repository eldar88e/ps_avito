class GoogleSheetsController < ApplicationController
  before_action :authenticate_user!
  include Turbo::StreamsHelper

  def index
    @stores = current_user.stores.order(:created_at)
  end
end
