class SettingsController < ApplicationController
  before_action :authenticate_user!

  def index
    @settings = Setting.all.order(:id)
    @setting  = Setting.new
  end

  def update
    @setting = Setting.find(params[:id])

    if @setting.update(setting_params)
      flash[:success] = "Настройка #{@setting.var} была успешно обновлена."
      redirect_to settings_path
    else
      error_notice(@setting.errors.full_messages)
    end
  end

  def create
    @setting = Setting.new(setting_new_params)

    if @setting.save
      flash[:success] = "Настройка #{@setting.var} была успешно добавлена."
      redirect_to settings_path
    else
      error_notice(@setting.errors.full_messages)
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
