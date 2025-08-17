import React, { useState, useEffect, useRef } from "react"; // Chuyển đổi sang functional component
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { connect } from "react-redux";

import Authentification from "../pages/auth/Authentification";
import MainMenu from "../pages/menu/MainMenu";
import { Button, FormControl, InputGroup, Form } from "react-bootstrap";
import { getAllProducts, searchProducts, getCart } from '../api/apiService';
import axios from "axios";

const Header = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Đồng bộ searchTerm với query trên URL khi ở đúng trang /products
  useEffect(() => {
    const isProductPage = window.location.pathname === "/products";
    if (isProductPage) {
      const params = new URLSearchParams(window.location.search);
      const search = params.get("search") || "";
      setSearchTerm(search);
    }
    // Không set lại searchTerm nếu không ở trang sản phẩm
  }, [window.location.pathname, window.location.search]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("2");
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
    };

    const fetchCartCount = async () => {
  try {
    const cartData = await getCart();
    if (cartData && Array.isArray(cartData.products)) {
      setCartCount(cartData.products.length);
    } else {
      setCartCount(0);
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    // Nếu lỗi xác thực thì xóa token và set trạng thái đăng nhập
    if (error.message && (error.message.includes('hết hạn') || error.message.includes('đăng nhập'))) {
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
    }
    setCartCount(0);
  }
};

    const fetchData = async () => {
      try {
        const productsResponse = await getAllProducts();
        if (productsResponse && Array.isArray(productsResponse)) {
          setProducts(productsResponse);

          const uniqueCategories = [...new Set(productsResponse
            .filter(product => product && product.category)
            .map(product => product.category))]
            .map((category, index) => ({
              categoryId: index + 1,
              categoryName: category
            }));
          setCategories(uniqueCategories);
        } else {
          console.error('Dữ liệu sản phẩm không hợp lệ:', productsResponse);
          setProducts([]);
          setCategories([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setProducts([]);
        setCategories([]);
      }
    };

    fetchUserData();
    fetchCartCount();
    fetchData();

    window.addEventListener('cartUpdated', fetchCartCount);

    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm || searchTerm.trim() === '') {
        setFilteredProducts([]);
        setShowDropdown(false);
        return;
      }

      try {
        const searchParams = {
          name: searchTerm,
          category: selectedCategory || null,
          sortBy: 'productName',
          sortDirection: 'asc'
        };

        const results = await searchProducts(searchParams);
        setFilteredProducts(results || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        setFilteredProducts([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setShowDropdown(false);
    }
  };

  const handleProfileClick = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/Login');
    } else {
      navigate('/Profile');
    }
  };
  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  return (
    <header>
      <div id="header" style={{ backgroundColor: "#c69a39" }}>
        <div className="container ps-5">
          <div className="row d-flex align-items-center justify-content-between ps-3   ">
            {/* Logo Section */}
            <div className="col-md-2 d-flex justify-content-center align-items-center">
              <Link to="/" className="logo">
                <img
                  src={require("../assets/images/img/logo-mobilecity-1.png")}
                  alt="logo"
                />
              </Link>
            </div>

            {/* Location Dropdown */}
            <div className="col-md-1 ps-3">
              <div className="location">
                <p className="location_title">Xem giá,tồn kho tại:</p>
                <div className="location-dropdown">
                  <div className="location-dropdown-title">
                    <select
                      className="location_name"
                      value={selectedLocation}
                      onChange={handleLocationChange}
                    >
                      <option value="1">Hà Nội</option>
                      <option value="2">TP. Hồ Chí Minh</option>
                      <option value="3">Đà Nẵng</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-md-3 d-flex justify-content-center align-items-center ps-5"
              // ref={searchRef}
            >
              {/* Thanh tìm kiếm */}
              <Form
                className="d-flex"
                style={{ width: "240px" }}
                onSubmit={handleSearchSubmit}
              >
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder="Tìm kiếm sản phẩm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="border-0 shadow-none"
                  />
                  <Button type="submit" variant="light" className="border-0">
                    <i className="fa fa-search"></i>
                  </Button>
                </InputGroup>
              </Form>
            </div>

            {/* Auth and Cart Section */}
            <div className="col-md-2 d-flex align-items-center ps-5">
              <ul className="navbar-nav ">
                <li className="header-item">
                  <Authentification />
                </li>
              </ul>
              <ul className="navbar-nav">
                <li className="cart">
                  <Link className="cart-item" to="/shopping-cart">
                    <div className="cart-content">
                      <i className="fa fa-shopping-cart"></i>
                      <span>Cart</span>
                    </div>
                    {props.cartCount > 0 && (
                      <div className="qty">{props.cartCount}</div>
                    )}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Navigation Links */}
            <div className="col-md-4 ps-5">
              <nav>
                <ul className="nav d-flex align-items-center">
                  <li className="nav-item">
                    <Link to="/news" className="nav-link">
                      TIN TỨC
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/events" className="nav-link">
                      EVENT
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/warranty" className="nav-link">
                      TRA CỨU BH
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <div className="col-md-12 d-flex justify-content-center ">
          <MainMenu />
        </div>
      </div>
    </header>
  );
};

const mapStateToProps = (state) => {
  return {
    wishlistCount: state.wishlist_count,
    cartCount: state.cart_count,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateWishlistCount: (count) =>
      dispatch({ type: "UPDATE_WISHLIST_COUNT", value: count }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
