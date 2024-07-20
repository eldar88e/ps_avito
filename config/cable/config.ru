require_relative "../environment"
Rails.application.eager_load!

run ActionCable.server
