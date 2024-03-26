class GoogleSheetsController < ApplicationController
  before_action :authenticate_user!

  def index
    #@google_sheets = Setting.all.select { |i| i['var'].match?(/tid/) }
    @stores = Store.order(:id)
  end
end
