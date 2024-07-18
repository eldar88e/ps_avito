module ApplicationHelper
  include Pagy::Frontend

  def paginator(ends)
    if ends > 5
      page = (params[:page].present? && params[:page].to_i.positive? && params[:page].to_i > 3) ? params[:page].to_i : 2
      if page == 2
        [0, page-1, page, page+1, page+2, '...', ends]
      elsif page == ends - 1
        [0, '...', page-3, page-2, page-1, page, ends]
      elsif page == ends - 2
        [0, '...', page-2, page-1, page, page+1, ends]
      elsif page == ends
        [0, '...', page-4, page-3, page-2, page-1, ends]
      else
        [0, '...', page-1, page, page+1, '...', ends]
      end
    else
      [*0..ends]
    end
  end
end
