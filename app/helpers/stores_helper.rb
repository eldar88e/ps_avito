module StoresHelper
  STORE_ELEMENTS = %w[div span ul li br b i strong em p].freeze

  private

  def sanitize(value)
    super(value, { elements: STORE_ELEMENTS })
  end
end
