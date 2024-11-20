class TopGamesJob < ApplicationJob
  queue_as :default
  KEYS = %i[sony_id name rus_voice rus_screen price_tl platform].freeze
  PRICE_LIMIT = 3000

  def perform(**args)
    games  = fetch_games(args[:settings]['quantity_games'])
    run_id = Run.last_id
    edited = [0]
    count  = games.reduce(0) { |acc, game| process_game(game, run_id, edited) ? acc + 1 : acc }
    Game.where.not(touched_run_id: run_id).update_all(deleted: 1)
    Run.finish
    send_notify(args[:user], count, edited.size, games.size)
    count
  rescue StandardError => e
    handle_error(args[:user], e)
  end

  private

  def handle_error(user, error)
    msg = "Error #{self.class} || #{error.message}"
    Rails.logger.error(msg)
    broadcast_notify(msg, 'danger')
    TelegramService.call(user, msg)
    0
  end

  def send_notify(user, count, edited, size)
    msg = "✅ Обновлено ТОП #{size} игр."
    msg += "\n#{I18n.t('jobs.top_games.add', count:)}" if count.positive?
    msg += "\n#{I18n.t('jobs.top_games.price', count: edited)}" if edited.positive?
    broadcast_notify(msg)
    TelegramService.call(user, msg)
  end

  def process_game(row, run_id, edited)
    filtered_row         = row.slice(*KEYS)
    row[:md5_hash]       = md5_hash(filtered_row)
    row[:touched_run_id] = run_id
    row[:deleted]        = 0
    result = update_game(row, edited)
    return if result

    row[:run_id] = run_id
    Game.create(row)
    true
  end

  def update_game(row, edited)
    game = Game.find_by(sony_id: row[:sony_id])
    return if game.nil?

    if game.md5_hash != row[:md5_hash]
      row[:price_updated] = row[:touched_run_id]
      edited[0] += 1
    end
    game.update(row)
    true
  end

  def fetch_games(quantity)
    db = Mysql2::Client.new(Rails.application.config.mysql2_adapter_config)
    db.query(query_db(quantity)).map.each_with_index do |game, idx|
      game[:top] = idx + 1
      game
    end
  ensure
    db&.close
  end

  def query_db(quantity)
    <<~SQL.squish
      SELECT
        sony_id, name, top, price, old_price, price_tl, discount_end_date, rus_voice, rus_screen, platform
      FROM (
        SELECT
          additional.janr AS sony_id, game.pagetitle AS name, game.menuindex AS top, additional.price,
          additional.old_price, additional.price_tl, additional.discount_end_date, additional.rus_voice,
          additional.rus_screen, additional.platform, MAX(game.createdon)
        FROM modx_site_content AS game
        JOIN modx_ms2_products AS additional
          ON game.id = additional.id
        WHERE
          game.parent IN (217, 218)
          AND game.deleted = 0
          AND game.published = 1
          AND additional.price_tl < #{PRICE_LIMIT}
        GROUP BY game.pagetitle, additional.platform
        ORDER BY game.menuindex
      ) AS grouped_games
      ORDER BY top
      LIMIT #{quantity};
    SQL
  end

  def md5_hash(hash)
    str = hash.values.join
    Digest::MD5.hexdigest(str)
  end
end
