Rails.application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'registrations'
  }

  #get "up" => "rails/health#show", as: :rails_health_check

  resources :settings, only: [:index, :create, :update]
  resources :games, only: [:index, :show] do
    resources :game_black_lists, only: [:create, :destroy]
  end
  resources :products
  resources :image_layers, only: [:new, :create, :show, :update, :destroy]
  resources :avitos, only: [:index, :show, :edit, :update]

  post 'avitos/:id/update_ads', to: 'avitos#update_ads', as: 'update_ads_avito'

  resources :stores do
    post '/update_img', to: 'jobs#update_img', as: 'update_img'
    post '/update_feed', to: 'jobs#update_feed', as: 'update_feed'

    resources :streets, only: [:index, :create, :update, :destroy]
    resources :maps, only: [:show]
    resources :addresses, only: [:new, :create, :show, :update, :destroy]
  end

  post '/update_products_img', to: 'jobs#update_products_img', as: 'update_products_img'

  root 'google_sheets#index'
  get '/google_sheets', to: 'google_sheets#index'

  authenticate :user do
    mount GoodJob::Engine => '/good_job'
    mount ExceptionTrack::Engine => "/exception-track"
  end
end
