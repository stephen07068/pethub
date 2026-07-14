def paginate_query(query, page, per_page=12):
    """Paginate a SQLAlchemy query and return data + meta."""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return pagination.items, {
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev,
    }
