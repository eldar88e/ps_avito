Rails.application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'registrations'
  }

  #get "up" => "rails/health#show", as: :rails_health_check

  resources :settings, only: [:index, :create, :update]
  resources :games, only: [:index, :show]
  root "games#index"
  get '/images/:filename', to: 'images#show', as: 'image'

  authenticate :user do
    mount GoodJob::Engine => '/good_job'
  end
end
