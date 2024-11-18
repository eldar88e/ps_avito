class GamePriceService
  class << self
    def call(price, store)
      percent       = store.percent || 0
      exchange_rate = make_exchange_rate(price)
      price_rub     = price * exchange_rate
      round_up_price(price_rub + (price_rub * percent / 100.0))
    end

    private

    def round_up_price(price)
      (price / 10.to_f).round * 10
    end

    def make_exchange_rate(price)
      exchange_rates = {
        (0..299) => ENV.fetch('LOWEST_PRICE', 5.5).to_f,
        (300..799) => ENV.fetch('LOW_PRICE', 5).to_f,
        (800..1199) => ENV.fetch('MEDIAN_PRICE', 4.5).to_f,
        (1200..1699) => ENV.fetch('HIGH_PRICE', 4.3).to_f
      }
      exchange_rates.each { |range, rate| return rate if range.include?(price) }

      ENV.fetch('HIGHEST_PRICE', 4).to_f
    end
  end
end
