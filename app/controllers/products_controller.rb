class ProductsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_product, only: %i[show edit update destroy]

  def index
    @products = current_user.products.order(:id)
                            .includes(ads: { store: [], address: [], image_attachment: :blob },
                                      image_attachment: :blob ).page(params[:page]).per(12)
  end

  def show; end

  def new
    @product = current_user.products.build
  end

  def edit; end

  def create
    @product = current_user.products.build(product_params)

    if @product.save
      msg = ["Объявление #{@product.title} было успешно добавлено."]
      msg << 'Внимание объявление не активно!' if product_params[:active].to_i.zero?
      flash[:success] = msg
      redirect_to @product
    else
      error_notice(@product.errors.full_messages)
    end
  end

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
      render turbo_stream: [turbo_stream.remove("product_#{@product.id}"), success_notice(msg)]
    else
      error_notice(@product.errors.full_messages)
    end
  end

  private

  def set_product
    @product = current_user.products.find(params[:id])
  end

  def product_params
    params.require(:product)
          .permit(:ad_status, :category, :goods_type, :ad_type, :image, :contact_method, :type, :platform,
                  :localization, :title, :price, :description, :condition, :allow_email, :active)
  end
end
