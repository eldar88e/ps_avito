class TopGamesJob < ActiveJob::Base
  queue_as :default

  def perform
    games = connect_db.query(query_db)
    run_id  = Run.last_id

    games.each do |row|
      keys = [:sony_id, :name, :rus_voice, :rus_screen, :price_tl, :platform]
      filtered_row         = row.slice(*keys)
      row[:md5_hash]       = md5_hash(filtered_row)
      row[:touched_run_id] = run_id

      game = Game.find_by(sony_id: row[:sony_id])
      if game
        game.update(row)
      else
        row[:run_id] = run_id
        Game.create!(row)
      end
    end

    Game.where.not(touched_run_id: run_id).destroy_all
    Run.finish
    TelegramService.new('✅ Game list updated!').report
  rescue => e
    TelegramService.new("Error #{self.class} || #{e.message}").report
    raise
  end

  private

  def connect_db
    Mysql2::Client.new(
      host: OPEN_PS_HOST,
      database: OPEN_PS_BD,
      username: OPEN_PS_USER,
      password: OPEN_PS_PASSWORD,
      symbolize_keys: true
    )
  end

  def query_db
    "
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
      LIMIT 1000
    "
  end

  def md5_hash(hash)
    str = hash.values.join
    Digest::MD5.hexdigest(str)
  end
end
