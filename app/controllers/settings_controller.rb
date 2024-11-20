class SettingsController < ApplicationController
  before_action :authenticate_user!

  def index
    @settings = current_user.settings.includes(:font_attachment).order(:created_at)
    @setting  = current_user.settings.build
  end

  def create
    @setting = current_user.settings.build(setting_new_params)
    if @setting.save
      render turbo_stream: [
        turbo_stream.before('settings_new', partial: 'settings/setting', locals: { setting: @setting }),
        success_notice(t('.success', var: @setting.var))
      ]
    else
      error_notice(@setting.errors.full_messages)
    end
  end

  def update
    @setting = current_user.settings.find(params[:id])
    if @setting.update(setting_params)
      render turbo_stream: [
        turbo_stream.replace("setting_#{@setting.id}", partial: 'settings/setting', locals: { setting: @setting }),
        success_notice(t('.success', var: @setting.var))
      ]
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
