class DescriptionService
  def initialize(**option)
    @model        = option[:model]
    @store        = option[:store]
    @address_desc = option[:address_desc].to_s
  end

  def make_description
    method_name = :"handle_#{@model.class.name.downcase}_desc"
    send(method_name)
  end

  def self.call(**option)
    new(**option).make_description
  end

  private

  def handle_game_desc
    desc_game = @store.desc_game.to_s + @store.description
    rus_voice = @model.rus_voice ? 'Есть' : 'Нет'
    rus_text  = @model.rus_screen ? 'Есть' : 'Нет'
    build_description(desc_game,
                      name: @model.name,
                      rus_voice:,
                      rus_text:,
                      platform: @model.platform,
                      manager: @store.manager_name,
                      addr_desc: @address_desc)
  end

  def handle_product_desc
    desc_product = @store.description + @store.desc_product.to_s
    build_description(desc_product,
                      name: @model.title,
                      desc_product: @model.description,
                      manager: @store.manager_name,
                      addr_desc: @address_desc)
  end

  def build_description(description, **replacements)
    replacements.each { |key, value| description = description.gsub("[#{key}]", value.to_s) }
    description.squeeze(' ').strip
  end
end
