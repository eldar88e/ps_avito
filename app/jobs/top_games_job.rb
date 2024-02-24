class TopGamesJob < ActiveJob::Base
  queue_as :default

  def perform(*args)
    client = Mysql2::Client.new(
      host: ENV["OPEN_PS_HOST"],
      database: ENV["OPEN_PS_BD"],
      username: ENV["OPEN_PS_USER"],
      password: ENV["OPEN_PS_PASSWORD"],
      symbolize_keys: true
    )

    results = client.query("
      SELECT
        additional.janr AS sony_id,
        game.pagetitle AS name,
        game.menuindex AS top,
        additional.price,
        additional.old_price,
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
    ")

    run_id = Run.last_id

    results.each do |row|
      keys           = [:sony_id, :name, :rus_voice, :rus_screen, :price, :old_price, :discount_end_date, :platform]
      filtered_row   = row.slice(*keys)
      row[:md5_hash] = md5_hash(filtered_row)

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

    PopulateGoogleSheetsJob.perform_now

    TelegramNotifier.new.report('👌Google sheets updated!')
  rescue => e
    Rails.logger.error "Error executing TopGamesJob || #{e}"
    TelegramNotifier.new.report("Error updating Google sheets\n#{e}")
    raise
  end

  private

  def md5_hash(hash)
    str = hash.values.join
    Digest::MD5.hexdigest(str)
  end
end
