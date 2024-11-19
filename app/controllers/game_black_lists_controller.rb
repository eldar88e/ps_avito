class GameBlackListsController < ApplicationController
  before_action :authenticate_user!
  add_breadcrumb 'Главная', :root_path

  def index
    add_breadcrumb 'Игры', games_path
    add_breadcrumb 'Блэк лист'
    @pagy, @black_lists = pagy(GameBlackList.all, items: 36)
  end

  def create
    @game = Game.find(params[:game_id])
    bl    = @game.build_game_black_list(comment: params[:game_black_list][:comment])
    return handle_turbo_frame('Игра была добавлена в блэк лист!') if bl.save

    error_notice(bl.errors.full_messages)
  end

  def destroy
    @bl = GameBlackList.find(params[:id])
    return handle_destroy if @bl.destroy

    error_notice(@bl.errors.full_messages)
  end

  private

  def handle_destroy
    @game = Game.find @bl.game.id
    msg   = 'Игра была удалена из черного списока!'
    handle_turbo_frame(msg)
  end

  def handle_turbo_frame(msg)
    render turbo_stream: [
      turbo_stream.update(:game_black_list_buttons, partial: '/game_black_lists/buttons'),
      success_notice(msg)
    ]
  end
end
