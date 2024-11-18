class TopGamesJob < ApplicationJob
  queue_as :default
  KEYS = %i[sony_id name rus_voice rus_screen price_tl platform].freeze

  def perform(**args)
    quantity = args[:settings]['quantity_games']
    games    = fetch_games(quantity)
    run_id   = Run.last_id
    count    = 0
    edited   = []
    games.each do |row|
      filtered_row         = row.slice(*KEYS)
      row[:md5_hash]       = md5_hash(filtered_row)
      row[:touched_run_id] = run_id
      row[:deleted]        = 0

      update_game(row, edited) && next

      row[:run_id] = run_id
      Game.create(row) && count += 1
    end

    Game.where.not(touched_run_id: run_id).update_all(deleted: 1)
    Run.finish
    msg = "✅ Обновлено ТОП #{games.size} игр."
    msg += "\n#{I18n.t('jobs.top_games.add', count:)}" if count.positive?
    msg += "\n#{I18n.t('jobs.top_games.price', count: edited.size)}" if edited.size.positive?
    broadcast_notify(msg)
    TelegramService.call(args[:user], msg)
    count
  rescue StandardError => e
    msg = "Error #{self.class} || #{e.message}"
    Rails.logger.error(msg)
    broadcast_notify(msg, 'danger')
    TelegramService.call(args[:user], msg)
    0
  end

  private

  def update_game(row, edited)
    game = Game.find_by(sony_id: row[:sony_id])
    return if game.nil?

    if game.md5_hash != row[:md5_hash]
      row[:price_updated] = row[:touched_run_id]
      edited << game.sony_id
    end
    game.update(row)
    true
  end

  def fetch_games(quantity)
    db = connect_db
    db.query(query_db(quantity)).to_a
  ensure
    db&.close
  end

  def connect_db
    Mysql2::Client.new(
      host: OPEN_PS_HOST,
      database: OPEN_PS_BD,
      username: OPEN_PS_USER,
      password: OPEN_PS_PASSWORD,
      symbolize_keys: true
    )
  end

  def query_db(quantity)
    <<~SQL.squish
      SELECT
        additional.janr AS sony_id,
        game.pagetitle AS name,
        game.menuindex AS top,
        additional.price,
        additional.old_price,
        additional.price_tl,
        additional.discount_end_date,
        additional.rus_voice,
        additional.rus_screen,
        additional.platform
      FROM modx_site_content AS game
      JOIN modx_ms2_products AS additional
        ON game.id = additional.id
      WHERE game.parent IN (217, 218)
        AND game.deleted = 0
        AND game.published = 1
      ORDER BY game.menuindex
      LIMIT #{quantity}
    SQL
  end

  # GROUP BY game.pagetitle
  # MIN(additional.price) AS price,

  def md5_hash(hash)
    str = hash.values.join
    Digest::MD5.hexdigest(str)
  end
end
