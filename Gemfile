source "https://rubygems.org"

ruby "3.2.2"
gem "rails", "~> 7.1.3"

gem "sprockets-rails"
gem "pg", "~> 1.5"
gem "good_job", "~> 3.24"
gem 'mysql2'
gem "puma", ">= 5.0"
gem "jsbundling-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "cssbundling-rails"
gem "jbuilder"
gem "redis", ">= 4.0.1"
gem "tzinfo-data", platforms: %i[ windows jruby ]
gem "bootsnap", require: false
gem 'rmagick'
gem 'google_drive'
gem 'dotenv', '~> 3.0'

# gem "image_processing", "~> 1.2"

group :development, :test do
  gem "debug", platforms: %i[ mri windows ]
  gem 'pry'
end

group :development do
  gem 'annotate'
  gem 'better_errors' # Shows better errors description on errors page
  gem 'binding_of_caller'
  gem 'chusaku', require: false # annotations for routes
  gem 'letter_opener'
  gem 'listen' # Monitoring changes in files and directories in real-time
  gem 'rails-erd'
  gem 'rubocop-performance'
  gem 'rubocop-rails'
  gem 'rubocop-rspec'
  gem 'web-console'
end

group :test do
  gem 'capybara'
  gem 'rspec-rails'
  gem 'selenium-webdriver'
end
