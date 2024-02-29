class SettingsController < ApplicationController
  before_action :authenticate_user!

  def index
    @settings = Setting.all.order(:id)
  end

  def update
    setting = Setting.find(params[:id])

    if setting.update(setting_params)
      redirect_to settings_path, alert: 'Setting edited!'
    else
      redirect_to settings_path, alert: 'Error editing setting!'
    end
  end

  def create
    setting = Setting.new(setting_new_params)

    if setting.save
      redirect_to settings_path, alert: 'Setting saved!'
    else
      redirect_to settings_path, alert: 'Error saving setting!'
    end
  end

  private

  def setting_params
    params.require(:setting).permit(:value, :description)
  end

  def setting_new_params
    params.require(:setting).permit(:var, :value, :description)
  end
end
