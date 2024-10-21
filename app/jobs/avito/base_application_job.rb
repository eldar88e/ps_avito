class Avito::BaseApplicationJob < ApplicationJob

  private

  def fetch_and_parse(avito, url, method = :get, payload=nil)
    response = avito.connect_to(url, method, payload)
    return if response&.status != 200

    JSON.parse(response.body)
  end
end
