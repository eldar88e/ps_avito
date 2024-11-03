class GameBlackListsController < ApplicationController
  before_action :authenticate_user!

  def create
    binding.pry
    @game = Game.find(params[:game_id])
    bl = @game.build_game_black_list(comment: params[:game_black_list][:comment])
    if bl.save
      render turbo_stream: [
        turbo_stream.update(:game_black_list_buttons, partial: '/games/game_black_list_buttons'),
        success_notice('Игра была добавлена в черный список!')
      ]
    else
      error_notice(bl.errors.full_messages)
    end
  end

  def destroy
    bl = GameBlackList.find(params[:id])
    if bl.destroy
      @game = bl.game
      render turbo_stream: [
        turbo_stream.update(:game_black_list_buttons, partial: '/games/game_black_list_buttons'),
        success_notice('Игра была удалена из черного списока!')
      ]
    else
      error_notice(bl.errors.full_messages)
    end
  end
end
