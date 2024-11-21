module StoresHelper
  WHITELIST = %w[div span ul li br b i strong em p].freeze

  private

  def sanitize(value)
    super(value, { elements: WHITELIST })
  end
end
