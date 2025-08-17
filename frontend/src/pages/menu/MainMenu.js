import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/css/mainmenu.css";
import { getAllCategories, getAllBrands } from "../../api/apiService";

// Chia brands thành nhiều cột cho dropdown
function splitBrandsToColumns(brands, columns = 3) {
  const result = Array.from({ length: columns }, () => []);
  brands.forEach((brand, idx) => {
    result[idx % columns].push(brand);
  });
  return result;
}

const MainMenu = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null); // categoryId hiện dropdown

  useEffect(() => {
    getAllCategories().then(setCategories);
    getAllBrands().then(setBrands);
  }, []);

  // Lấy brands theo categoryId
  const getBrandsByCategory = (categoryId) => {
    return brands.filter((brand) => Array.isArray(brand.categoryIds) && brand.categoryIds.includes(categoryId));
  };

  return (
    <div className="p-4 pb-5">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="nav-item me-4 d-flex align-items-center position-relative"
                  onMouseEnter={() => setDropdownOpen(cat.id)}
                  onMouseLeave={() => setDropdownOpen(null)}
                  style={{ cursor: "pointer" }}
                >
                  <Link
                    className="nav-link active d-flex align-items-center"
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                  >
                    <img
                      src={cat.imageUrl ? `http://localhost:8900/api/catalog/images/${cat.imageUrl}` : "/default-category.png"}
                      alt={cat.name}
                      style={{
                        width: 28,
                        height: 28,
                        objectFit: "contain",
                        marginRight: 8,
                      }}
                    />
                    <span>{cat.name}</span>
                  </Link>
                  {/* Dropdown brand chia cột, có tiêu đề */}
                  {dropdownOpen === cat.id && getBrandsByCategory(cat.id).length > 0 && (
                    <div
                      className="dropdown-menu show"
                      // style={{
                      //   top: 0,
                      //   left: 0,
                      //   minWidth: 500,
                      //   display: "flex",
                      //   gap: 32,
                      //   flexWrap: "wrap"
                      // }}
                    >
                      <div style={{ fontWeight: "bold", color: "#c69a39", marginBottom: 8, width: "100%" }}>Hãng sản xuất</div>
                      {splitBrandsToColumns(getBrandsByCategory(cat.id), 3).map((col, colIdx) => (
                        <ul key={colIdx} style={{ listStyle: "none", padding: 0, margin: 0, minWidth: 150 }}>
                          {col.map((brand) => (
                            <li key={brand.id}>
                              <Link className="dropdown-item" to={`/products?category=${encodeURIComponent(cat.name)}&brand=${encodeURIComponent(brand.name)}`}>{brand.name}</Link>
                            </li>
                          ))}
                        </ul>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MainMenu;
