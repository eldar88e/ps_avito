Rails.application.routes.draw do
  devise_for :users, controllers: {
    registrations: 'registrations'
  }

  #get "up" => "rails/health#show", as: :rails_health_check

  resources :settings, only: [:index, :create, :update]
  resources :games, only: [:index, :show]
  resources :stores
  resources :products
  resources :image_layers
  resources :addresses
  resources :avitos, only: [:index, :show, :edit, :update]

  resources :stores do
    ####
    # post '/store_test_img', to: 'jobs#update_store_test_img', as: 'update_store_test_img'
    ####

    post '/update_img', to: 'jobs#update_img', as: 'update_img'
    post '/update_feed', to: 'jobs#update_feed', as: 'update_feed'
  end

  post '/update_products_img', to: 'jobs#update_products_img', as: 'update_products_img'

  root 'google_sheets#index'
  get '/google_sheets', to: 'google_sheets#index'

  authenticate :user do
    mount GoodJob::Engine => '/good_job'
    mount ExceptionTrack::Engine => "/exception-track"
  end
end
