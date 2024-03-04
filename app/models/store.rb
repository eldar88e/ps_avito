class Store < ApplicationRecord
  validates :var, presence: true, uniqueness: true
  #validates :ad_status, presence: true
  validates :category, presence: true
  validates :goods_type, presence: true
  validates :ad_type, presence: true
  validates :address, presence: true
  validates :description, presence: true
  validates :condition, presence: true
  validates :allow_email, presence: true
  validates :manager_name, presence: true
  validates :contact_phone, presence: true
  #validates :watermark_params, presence: true
end
