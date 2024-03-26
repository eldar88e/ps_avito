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

  post '/stores/:store_id/store_test_img', to: 'jobs#update_store_test_img', as: 'update_store_test_img'
  post '/stores/:store_id/addresses/:address_id/update_img', to: 'jobs#update_img', as: 'update_img'
  post '/stores/:store_id/update_feed', to: 'jobs#update_feed', as: 'update_feed'
  post '/update_products_img', to: 'jobs#update_products_img', as: 'update_products_img'

  root 'games#index'
  get '/google_sheets', to: 'google_sheets#index'

  authenticate :user do
    mount GoodJob::Engine => '/good_job'
  end
end
