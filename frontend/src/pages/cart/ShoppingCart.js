import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { toast } from 'react-toastify';
import { getCart, updateCartItem, removeFromCart, createOrder, addToCart, getAllProducts } from "../../api/apiService";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  // State tạm lưu số lượng đang nhập cho từng item
  const [quantityInputs, setQuantityInputs] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  // Tính tổng giá trị giỏ hàng
  useEffect(() => {
    calcTotal();
  }, [cartItems]);

  // Hàm thêm sản phẩm vào giỏ hàng (gộp số lượng nếu đã có)
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      // Kiểm tra sản phẩm đã có trong cart chưa
      const existed = cartItems.find(item => item.product && item.product.id === productId);
      if (existed) {
        // Nếu có rồi thì tăng số lượng
        await updateCartItem(productId, existed.quantity + quantity);
        toast.success('Đã cập nhật số lượng sản phẩm!', { autoClose: 2000 });
      } else {
        // Nếu chưa có thì thêm mới
        await addToCart(productId, quantity);
        toast.success('Đã thêm sản phẩm vào giỏ hàng!', { autoClose: 2000 });
      }
      await fetchCart();
    } catch (error) {
      toast.error('Có lỗi khi thêm/cập nhật sản phẩm!', { autoClose: 2000 });
    }
  };


  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCartItems(data.products || []);
      setLoading(false);
      // Luôn tính lại tổng tiền với toàn bộ sản phẩm
      calcTotal();
    } catch (error) {
      setLoading(false);
    }
  };

  // Sửa số lượng trên UI (tăng/giảm/input) và đồng bộ backend
  const handleQuantityChange = async (itemId, type, value) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    let newQuantity = item.quantity;
    if (type === "up") newQuantity += 1;
    else if (type === "down") newQuantity -= 1;
    else if (type === "input") {
      // Chỉ cập nhật state tạm, không gọi API
      const val = value.replace(/[^\d]/g, '');
      setQuantityInputs(q => ({ ...q, [itemId]: val }));
      return;
    }
    if (newQuantity < 1 || newQuantity > 100) return;
    setQuantityInputs(q => ({ ...q, [itemId]: String(newQuantity) }));
    await updateCartItem(item.product.id, newQuantity);
    await fetchCart();
    calcTotal();
  };

  // Khi blur hoặc Enter, mới thực sự update backend
  const handleQuantityInputBlur = async (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    let val = quantityInputs[itemId] !== undefined ? quantityInputs[itemId] : item.quantity;
    val = parseInt(val);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 100) val = 100;
    if (val === item.quantity) return;
    setQuantityInputs(q => ({ ...q, [itemId]: String(val) }));
    await updateCartItem(item.product.id, val);
    await fetchCart();
    calcTotal();
  };

  // Khi bấm Enter trong input
  const handleQuantityInputKeyDown = (e, itemId) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };


  // Đã bỏ chọn sản phẩm, không còn handleSelectChange


  const calcTotal = () => {
    let sub = 0;
    cartItems.forEach((item) => {
      if (item.product) {
        sub += (item.product.price || 0) * item.quantity;
      }
    });
    setSubtotal(sub);
    setTotal(sub);
  };

  // Xóa sản phẩm khỏi giỏ hàng: truyền đúng product.id
  const handleDelete = async (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item || !item.product) return;
    try {
      await removeFromCart(item.product.id);
      await fetchCart();
      // Cập nhật lại tổng tiền
      calcTotal();
      toast.success('Xóa sản phẩm thành công!', { autoClose: 2000 });
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm!', { autoClose: 2000 });
    }
  };


  // Giả sử bạn có biến allProducts chứa toàn bộ sản phẩm (có availability)
  // Nếu chưa có, cần fetch và lưu vào state khi load trang

  // Thêm state lưu allProducts
  // const [allProducts, setAllProducts] = useState([]);

  // ...fetchAllProducts() và setAllProducts khi load trang
  const [allProducts, setAllProducts] = useState([]);

  // Lấy toàn bộ sản phẩm khi load trang để kiểm tra tồn kho
  useEffect(() => {
    // Giả sử bạn đã có hàm getAllProducts trả về danh sách sản phẩm (có availability)
    const fetchAllProducts = async () => {
      try {
        const products = await getAllProducts(); // hoặc fetchAllProducts()
        setAllProducts(products || []);
      } catch (error) {
        setAllProducts([]);
      }
    };
    fetchAllProducts();
  }, []);
  const handleCheckout = async (e) => {
    // Kiểm tra tồn kho trước khi cho phép checkout
    // Kiểm tra sản phẩm hết hàng
    const soldOutItem = cartItems.find(item => {
      if (!item.product) return false;
      let availability = item.product.availability;
      if ((availability === undefined || availability === null) && typeof allProducts !== 'undefined') {
        const found = allProducts.find(p => p.id === item.product.id);
        availability = found ? found.availability : null;
      }
      return availability === 0;
    });
    if (soldOutItem) {
      toast.error(`Sản phẩm "${soldOutItem.product.productName}" đã hết hàng!`, { autoClose: 3000 });
      if (e && e.preventDefault) e.preventDefault();
      return;
    }
    // Kiểm tra vượt quá tồn kho
    const outOfStock = cartItems.find(item => {
      if (!item.product) return false;
      let availability = item.product.availability;
      if ((availability === undefined || availability === null) && typeof allProducts !== 'undefined') {
        const found = allProducts.find(p => p.id === item.product.id);
        availability = found ? found.availability : null;
      }
      if (availability === null || availability === undefined) return false;
      return typeof availability === 'number' && item.quantity > availability;
    });
    if (outOfStock) {
      toast.error(`Sản phẩm "${outOfStock.product.productName}" vượt quá số lượng tồn kho!`, { autoClose: 3000 });
      if (e && e.preventDefault) e.preventDefault();
      return;
    }
    // Cảnh báo nếu sản phẩm gần hết hàng
    const nearlyOut = cartItems.filter(item => {
      if (!item.product) return false;
      let availability = item.product.availability;
      if ((availability === undefined || availability === null) && typeof allProducts !== 'undefined') {
        const found = allProducts.find(p => p.id === item.product.id);
        availability = found ? found.availability : null;
      }
      return typeof availability === 'number' && availability > 0 && availability <= 3;
    });
    if (nearlyOut.length > 0) {
      toast.warn(`Lưu ý: Một số sản phẩm sắp hết hàng: ${nearlyOut.map(i => '"' + i.product.productName + '"').join(', ')} (còn lại <= 3)`, { autoClose: 4000 });
    }

    // Nếu hợp lệ thì cho phép chuyển trang
    // Có thể bổ sung logic tạo đơn hàng ở đây nếu cần
    // await createOrder(userId);
  };



  return (
    <div>
      <React.Fragment>
        <div id="breadcrumb" className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h3 className="breadcrumb-header">Giỏ hàng</h3>
                <ul className="breadcrumb-tree">
                  <li>
                    <a href="#">Trang chủ</a>
                  </li>
                  <li className="active">Giỏ Hàng</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-7 cart-items">
                <div className="section-title cart-item">
                  <h3 className="title">
                    Giỏ hàng {cartItems.length > 0 && `(${cartItems.length})`}
                  </h3>

                </div>
                {/* Cart Items */}
                {loading ? (
                  <div className="spinner-container">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const product = item.product || {};
                    const image = product.imageUrl
                      ? `http://localhost:8900/api/catalog/images/${product.imageUrl}`
                      : "/default-image.jpg";
                    return (
                      <div key={item.id} className="cart-item">
                        <div className="media cart-item-box">

                          <img
                            height="100"
                            width="100"
                            className="align-self-start mr-3"
                            src={image}
                            alt={product.productName || "Ảnh sản phẩm"}
                            onError={e => { e.target.src = "/default-image.jpg"; }}
                          />
                          <div className="media-body cart-item-body">
                            <h5 className="mt-0 product-name">
                              <Link to={`/products/${product.id}`}>
                                {product.productName || "Không có tên"}
                              </Link>
                            </h5>
                            <div>
                              <strong>Số lượng:</strong>
                              <div className="buy-item">
                                <div className="qty-label">
                                  <div className="input-number">
                                    <input
                                      id={item.id}
                                      type="number"
                                      min={1}
                                      max={100}
                                      value={quantityInputs[item.id] !== undefined ? quantityInputs[item.id] : item.quantity}
                                      onChange={e => handleQuantityChange(item.id, "input", e.target.value)}
                                      onBlur={() => handleQuantityInputBlur(item.id)}
                                      onKeyDown={e => handleQuantityInputKeyDown(e, item.id)}
                                      style={{
                                        width: 90,
                                        height: 38,
                                        fontSize: 18,
                                        textAlign: 'center',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '2px 8px',
                                        boxSizing: 'border-box',
                                        background: '#fff',
                                        marginRight: 6,
                                        marginLeft: 6
                                      }}
                                    />
                                    <span
                                      id={item.id}
                                      className="qty-up"
                                      onClick={() => handleQuantityChange(item.id, "up")}
                                    >+</span>
                                    <span
                                      id={item.id}
                                      className="qty-down"
                                      onClick={() => handleQuantityChange(item.id, "down")}
                                    >-</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <sub>
                                <strong>Miễn phí vận chuyển</strong>
                              </sub>
                            </div>
                            <h4 className="product-price">
                              {product.price ? product.price.toLocaleString('vi-VN') : 0} VND
                            </h4>
                          </div>
                          <div className="delete-icon">
                            <i
                              id={item.id}
                              onClick={() => handleDelete(item.id)}
                              className="fa fa-trash"
                              aria-hidden="true"
                            ></i>
                          </div>
                         
                        </div>
                      </div>
                    );
                  })
                )}
                {/* /Cart Items */}
              </div>
              {/* Tổng giá */}
              <div className="col-md-4 cart-details">
                <div className="section-title text-center">
                  <h3 className="title">Tổng giá</h3>
                </div>
                <div className="cart-summary">
                  <div className="order-col">
                    <div>Tổng tiền</div>
                    <div>{subtotal.toLocaleString('vi-VN')} VND</div>
                  </div>
                  <div className="order-col">
                    <div>Phí giao hàng</div>
                    <div>
                      <strong>MIỄN PHÍ</strong>
                    </div>
                  </div>
                  <hr />
                  <div className="order-col">
                    <div>
                      <strong>Tổng</strong>
                    </div>
                    <div>
                      <strong
                        className={cartItems.length !== 0 ? "order-total" : "order-total-disabled"}
                      >
                        {total.toLocaleString('vi-VN')} VND
                      </strong>
                    </div>
                  </div>
                </div>
                <Link
                  onClick={handleCheckout}
                  to={"/dat-hang"}
                  className={cartItems.length !== 0 ? "primary-btn order-submit" : "primary-btn order-submit-disabled"}
                >
                  Thanh toán
                </Link>
                <Link
                  to="/profile/orders"
                  className="primary-btn order-history-btn"
                  style={{ marginTop: '10px', display: 'block' }}
                >
                  Lịch sử đặt hàng
                </Link>
              </div>
              {/* /Tổng giá */}
            </div>
          </div>
        </div>
      </React.Fragment>
    </div>
  );
};

export default ShoppingCart;
   