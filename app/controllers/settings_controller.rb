class SettingsController < ApplicationController
  before_action :authenticate_user!

  def index
    @settings = Setting.all.order(:id)
    @setting = Setting.new
  end

  def update
    @setting = Setting.find(params[:id])

    if @setting.update(setting_params)
      redirect_to settings_path, alert: 'Setting edited!'
    else
      @settings = Setting.all.order(:id)
      render :index, alert: 'Error editing setting!'
    end
  end

  def create
    @setting = Setting.new(setting_new_params)

    if @setting.save
      redirect_to settings_path, alert: 'Setting saved!'
    else
      @settings = Setting.all.order(:id)
      render :index, alert: 'Error saving setting!'
    end
  end

  private

  def setting_params
    params.require(:setting).permit(:value, :description, :font)
  end

  def setting_new_params
    params.require(:setting).permit(:var, :value, :description)
  end
end
