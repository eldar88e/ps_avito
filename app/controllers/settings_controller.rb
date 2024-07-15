class SettingsController < ApplicationController
  before_action :authenticate_user!

  def index
    @settings = current_user.settings.order(:created_at)
    @setting  = current_user.settings.build
  end

  def update
    @setting = current_user.settings.find(params[:id])

    if @setting.update(setting_params)
      flash[:success] = "Настройка #{@setting.var} была успешно обновлена."
      redirect_to settings_path
    else
      error_notice(@setting.errors.full_messages)
    end
  end

  def create
    @setting = current_user.settings.build(setting_new_params)

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
