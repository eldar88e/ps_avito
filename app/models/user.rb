class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :stores, dependent: :destroy
  has_many :settings, dependent: :destroy
  has_many :products, dependent: :destroy

  def member_of?(store)
    stores.include?(store)
  end
end
