module StoresHelper
  STORE_ELEMENTS = %w[div span ul li br b i strong em p].freeze

  private

  def sanitize_description(value)
    sanitize(value, { elements: STORE_ELEMENTS })
  end
end
