Rails.application.configure do
  OPEN_PS_HOST     = ENV.fetch("OPEN_PS_HOST")
  OPEN_PS_BD       = ENV.fetch("OPEN_PS_BD")
  OPEN_PS_USER     = ENV.fetch("OPEN_PS_USER")
  OPEN_PS_PASSWORD = ENV.fetch("OPEN_PS_PASSWORD")
end