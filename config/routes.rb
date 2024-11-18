Rails.application.routes.draw do
  mount ActionCable.server => '/cable' if Rails.env.production?
  # get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users, controllers: { registrations: 'registrations' }

  authenticate :user do
    mount GoodJob::Engine => '/good_job'
    mount ExceptionTrack::Engine => '/exception-track'
  end

  root 'feeds#index'

  resources :settings, only: %i[index create update]
  resources :games, only: %i[index show destroy]
  resources :game_black_lists, only: %i[index create destroy]
  resources :products
  resources :image_layers, only: %i[new create show update destroy]
  resources :avitos, only: [:index]
  post '/update_img', to: 'jobs#update_img'
  get '/feeds', to: 'feeds#index'

  resources :stores do
    draw :avito
    get '/avito', to: 'avito/dashboard#index'

    post '/update_feed', to: 'jobs#update_feed', as: 'update_feed'
    post '/update_ban_list', to: 'jobs#update_ban_list'
    patch '/update_all', to: 'ads#update_all'

    resources :streets, only: %i[index create update destroy]
    resources :maps, only: [:show]
    resources :addresses, only: %i[new create show update destroy]
  end
end
