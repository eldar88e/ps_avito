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
      if price < 300
        ENV.fetch('LOWEST_PRICE') { 5.5 }.to_f
      elsif price >= 300 && price < 800
        ENV.fetch('LOW_PRICE') { 5 }.to_f
      elsif price >= 800 && price < 1200
        ENV.fetch('MEDIAN_PRICE') { 4.5 }.to_f
      elsif price >= 1200 && price < 1700
        ENV.fetch('HIGH_PRICE') { 4.3 }.to_f
      else
        ENV.fetch('HIGHEST_PRICE') { 4 }.to_f
      end
    end
  end
end
