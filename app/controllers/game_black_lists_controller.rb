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
    if bl.save
      render turbo_stream: [
        turbo_stream.update(:game_black_list_buttons, partial: '/game_black_lists/buttons'),
        success_notice('Игра была добавлена в блэк лист!')
      ]
    else
      error_notice(bl.errors.full_messages)
    end
  end

  def destroy
    bl = GameBlackList.find(params[:id])
    return unless bl.destroy

    @game = bl.game
    @game unless render turbo_stream: success_notice('Игра была удалена из черного списока!')

    render turbo_stream: [
      turbo_stream.update(:game_black_list_buttons, partial: '/game_black_lists/buttons'),
      success_notice('Игра была удалена из черного списока!')
    ]
  end
end
