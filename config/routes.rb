Rails.application.routes.draw do
  mount ActionCable.server => '/cable' if Rails.env.production?
  #get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users, controllers: { registrations: 'registrations' }

  resources :settings, only: [:index, :create, :update]
  resources :games, only: [:index, :show, :destroy]
  resources :game_black_lists, only: [:index, :create, :destroy]
  resources :products
  resources :image_layers, only: [:new, :create, :show, :update, :destroy]
  resources :avitos, only: [:index]
  post '/update_img', to: 'jobs#update_img'

  resources :stores do
    post '/update_feed', to: 'jobs#update_feed', as: 'update_feed'
    post '/update_ban_list', to: 'jobs#update_ban_list'
    patch '/update_all', to: 'ads#update_all'

    resources :streets, only: [:index, :create, :update, :destroy]
    resources :maps, only: [:show]
    resources :addresses, only: [:new, :create, :show, :update, :destroy]

    namespace :avito do
      get '/dashboard', to: 'dashboard#index'
      get '/reports', to: 'reports#index'
      get '/reports/:id', to: 'reports#show'
      get '/items', to: 'items#index'
      get '/autoload/edit', to: 'autoload#edit'
      patch '/autoload', to: 'autoload#update'
      get '/autoload', to: 'autoload#show'
      post '/autoload/update_ads', to: 'autoload#update_ads'

      post '/webhooks/receive', to: 'webhooks#receive'
      resources :chats, only: [:index, :show, :create]
      resources :reviews, only: [:index, :edit, :update, :destroy]
      resources :settings, only: [:index, :update]
    end

    match '/avito', to: 'avito/dashboard#index', via: :get
  end

  root 'feeds#index'
  get '/feeds', to: 'feeds#index'

  authenticate :user do
    mount GoodJob::Engine => '/good_job'
    mount ExceptionTrack::Engine => "/exception-track"
  end
end
