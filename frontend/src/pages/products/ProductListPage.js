import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { searchProducts, getAllCategories, getAllBrands } from "../../api/apiService";
import ProductItem from "./ProductItem";
import "../../assets/css/product.css";
import "../../assets/css/pagination-custom.css";

const defaultSorts = [
  { value: "default", label: "Mặc định", direction: "" },
  { value: "price", label: "Giá tăng dần", direction: "asc" },
  { value: "price", label: "Giá giảm dần", direction: "desc" },
  { value: "productName", label: "Tên A-Z", direction: "asc" },
  { value: "productName", label: "Tên Z-A", direction: "desc" },
];

const PAGE_SIZE = 5;

const ProductListPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "",
    sortDirection: "",
  });
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy query từ URL (ví dụ ?search=iphone hoặc ?category=Điện thoại)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "";
    const brand = params.get("brand") || "";
    const search = params.get("search") || "";
    if (search) {
      setFilters((prev) => ({ ...prev, name: search, category: "", brand: "" })); // Ưu tiên search theo tên
    } else if (category && brand) {
      setFilters((prev) => ({ ...prev, category, brand, name: "" }));
    } else if (category) {
      setFilters((prev) => ({ ...prev, category, brand: "", name: "" }));
    } else if (brand) {
      setFilters((prev) => ({ ...prev, brand, category: "", name: "" }));
    } else {
      setFilters((prev) => ({ ...prev, name: "", category: "", brand: "" }));
    }
    getAllCategories().then(setCategories);
    getAllBrands().then(setBrands);
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    setError("");
    // Map category name và brand name sang id để truyền vào API (không phân biệt hoa thường, loại bỏ khoảng trắng)
    const normalize = str => (str || "").trim().toLowerCase();
    const categoryObj = categories.find((cat) => normalize(cat.name) === normalize(filters.category));
    const categoryId = categoryObj ? categoryObj.id : undefined;
    const brandObj = brands.find((b) => normalize(b.name) === normalize(filters.brand));
    const brandId = brandObj ? brandObj.id : undefined;

    // Tạo filter mới truyền vào API, bỏ category và brand dạng name
    const apiFilters = {
      ...filters,
      category: undefined,
      brand: undefined,
      categoryId,
      brandId,
      page,
      pageSize: PAGE_SIZE,
    };
    searchProducts(apiFilters)
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Lỗi tải sản phẩm");
        setLoading(false);
      });
  }, [filters, page, categories, brands]);

  // Lọc brand động theo danh mục
  const brandsByCategory = useMemo(() => {
    if (!filters.category) return brands;
    const catObj = categories.find((c) => c.name === filters.category);
    if (!catObj) return [];
    return brands.filter((b) => Array.isArray(b.categoryIds) && b.categoryIds.includes(catObj.id));
  }, [brands, filters.category, categories]);

  // Xử lý thay đổi filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFilters((prev) => ({ ...prev, category: value, brand: "" })); // Reset brand khi đổi danh mục
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
    setPage(1);
  };


  const handleSortChange = (e) => {
    const [sortBy, sortDirection] = e.target.value.split("|");
    if (sortBy === "default") {
      setFilters((prev) => ({ ...prev, sortBy: "", sortDirection: "" }));
    } else {
      setFilters((prev) => ({ ...prev, sortBy, sortDirection }));
    }
  };


  const handleOpenFilter = () => setShowFilter(true);
  const handleCloseFilter = () => setShowFilter(false);
  const handleApplyFilter = (e) => {
    e.preventDefault();
    setShowFilter(false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
        {/* Thanh filter ngang */}
        <div className="d-flex flex-wrap align-items-center gap-2" style={{overflowX: 'auto'}}>
          <button
            className={`btn btn-outline-primary${!filters.brand ? ' active' : ''}`}
            style={{minWidth: 80}}
            onClick={() => {
              setFilters(f => ({...f, brand: ''}));
              setPage(1);
            }}
          >
            <i className="fa fa-filter me-2"></i>Tất cả thương hiệu
          </button>
          {brandsByCategory.map((brand) => (
            <button
              key={brand.id}
              className={`btn btn-light d-flex align-items-center gap-1${filters.brand === brand.name ? ' active border-primary' : ''}`}
              style={{border: '1px solid #eee', borderRadius: 20, padding: '2px 10px', fontWeight: 500, background: filters.brand === brand.name ? '#e6f0ff' : '#fff'}}
              onClick={() => {
                setFilters(f => ({...f, brand: brand.name}));
                setPage(1);
              }}
            >
              {brand.imageUrl && (
                <img src={`http://localhost:8900/api/catalog/images/${brand.imageUrl}`} alt={brand.name} style={{height: 20, width: 40, objectFit: 'contain', marginRight: 4, borderRadius: 4}} />
              )}
              <span style={{fontWeight: filters.brand === brand.name ? 'bold' : 400}}>{brand.name}</span>
            </button>
          ))}
        </div>
        {/* Dropdown sắp xếp */}
        <select className="form-select w-auto ms-3" onChange={handleSortChange} value={`${filters.sortBy||'default'}|${filters.sortDirection||''}`}>
          {defaultSorts.map((s) => (
            <option
              key={s.value + s.direction}
              value={`${s.value}|${s.direction}`}
            >
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {/* Bộ lọc giá và danh mục (có thể bổ sung thêm filter khác nếu muốn) */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <select
          className="form-select w-auto"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <input
          type="number"
          className="form-control w-auto"
          name="minPrice"
          placeholder="Giá từ"
          value={filters.minPrice}
          onChange={handleFilterChange}
          style={{maxWidth: 120}}
        />
        <input
          type="number"
          className="form-control w-auto"
          name="maxPrice"
          placeholder="Đến"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          style={{maxWidth: 120}}
        />
      </div>

      {loading ? (
        <div>Đang tải sản phẩm...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <div className="row">
          {products.length === 0 ? (
            <div>Không có sản phẩm phù hợp.</div>
          ) : (
            <>
              {products.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
              {/* Pagination */}
              <nav className="mt-3 d-flex justify-content-center">
                <ul className="pagination">
                  {/* Previous */}
                  <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page-1)} disabled={page === 1}>&lt;</button>
                  </li>
                  {/* First Page */}
                  <li className={`page-item${page === 1 ? ' active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(1)}>1</button>
                  </li>
                  {/* Dots before current if needed */}
                  {page > 3 && (
                    <li className="page-item disabled"><span className="page-link">...</span></li>
                  )}
                  {/* Previous page */}
                  {page > 2 && page < Math.ceil(products.length / PAGE_SIZE) && (
                    <li className="page-item">
                      <button className="page-link" onClick={() => setPage(page-1)}>{page-1}</button>
                    </li>
                  )}
                  {/* Current page (not first/last) */}
                  {page !== 1 && page !== Math.ceil(products.length / PAGE_SIZE) && (
                    <li className="page-item active">
                      <button className="page-link" onClick={() => setPage(page)}>{page}</button>
                    </li>
                  )}
                  {/* Next page */}
                  {page < Math.ceil(products.length / PAGE_SIZE) - 1 && (
                    <li className="page-item">
                      <button className="page-link" onClick={() => setPage(page+1)}>{page+1}</button>
                    </li>
                  )}
                  {/* Dots after current if needed */}
                  {page < Math.ceil(products.length / PAGE_SIZE) - 2 && (
                    <li className="page-item disabled"><span className="page-link">...</span></li>
                  )}
                  {/* Last Page (only if more than 1 page) */}
                  {Math.ceil(products.length / PAGE_SIZE) > 1 && (
                    <li className={`page-item${page === Math.ceil(products.length / PAGE_SIZE) ? ' active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(Math.ceil(products.length / PAGE_SIZE))}>{Math.ceil(products.length / PAGE_SIZE)}</button>
                    </li>
                  )}
                  {/* Next */}
                  <li className={`page-item${page === Math.ceil(products.length / PAGE_SIZE) ? ' disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page+1)} disabled={page === Math.ceil(products.length / PAGE_SIZE)}>&gt;</button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
