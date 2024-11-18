Rails.application.config.mysql2_adapter_config = {
  host: ENV.fetch('OPEN_PS_HOST'),
  database: ENV.fetch('OPEN_PS_BD'),
  username: ENV.fetch('OPEN_PS_USER'),
  password: ENV.fetch('OPEN_PS_PASSWORD'),
  symbolize_keys: true
}
