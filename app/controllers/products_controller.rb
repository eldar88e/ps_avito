class ProductsController < ApplicationController
  before_action :authenticate_user!

  def index
    @products = Product.all
  end

  def show
    @product = Product.find(params[:id])
  end

  def new
    @product = Product.new
  end

  def create
    @product = Product.new(product_params)

    if @product.save
      redirect_to @product, notice: 'Product was successfully created.'
    else
      render :new
    end
  end

  def edit
    @product = Product.find(params[:id])
  end

  def update
    @product = Product.find(params[:id])

    if @product.update(product_params)
      redirect_to @product, notice: 'Product was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @product = Product.find(params[:id])
    notice =
      if @product&.destroy
        'Product was successfully deleted.'
      else
        'Product was not deleted!'
      end
    redirect_to products_path, notice: notice
  end

  private

  def product_params
    params.require(:product).permit(:ad_status, :category, :goods_type, :ad_type, :image,
                                    :title, :price, :description, :condition, :allow_email)
  end
end
