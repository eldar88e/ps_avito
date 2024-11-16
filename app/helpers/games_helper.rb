module GamesHelper
  def caption(game, model, title)
    "#{game.send(title)} — #{model.store.manager_name} - #{model.address.city}" if model.is_a?(Ad)
  end
end
