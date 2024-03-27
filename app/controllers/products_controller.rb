class ProductsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_product, only: [:show, :edit, :update, :destroy]

  def index
    @products = Product.order(:id).page(params[:page]).per(12)
  end

  def show; end

  def new
    @product = Product.new
  end

  def create
    @product = Product.new(product_params)

    if @product.save
      msg = ["Объявление #{@product.title} было успешно добавлено."]
      msg << 'Внимание объявление не активно!' if product_params[:active].to_i.zero?
      flash[:success] = msg
      redirect_to @product
    else
      error_notice(@product.errors.full_messages)
    end
  end

  def edit; end

  def update
    if @product.update(product_params)
      msg = ["Объявление #{@product.title} было успешно обновлено."]
      msg << 'Внимание объявление не активно!' if product_params[:active].to_i.zero?
      flash[:success] = msg
      redirect_to @product
    else
      error_notice(@product.errors.full_messages)
    end
  end

  def destroy
    if @product.destroy
      msg = "Объявление #{@product.title} было успешно удалено."
      render turbo_stream: [ turbo_stream.remove("product_#{@product.id}"), success_notice(msg)]
    else
      error_notice(@product.errors.full_messages)
    end
  end

  private

  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.require(:product)
          .permit(:ad_status, :category, :goods_type, :ad_type, :image, :contact_method,
                  :title, :price, :description, :condition, :allow_email, :active)
  end
end
