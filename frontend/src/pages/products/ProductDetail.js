import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Spinner, Alert, Container } from "react-bootstrap";
import {
  getProductById,
  addToCart,
  getProductReviews,
  getAuthUser,
  addProductReview,
  getProductsByCategory,
} from "../../api/apiService";
import { Helmet } from "react-helmet";
import "../../assets/css/product-detail.css";
import { getUserByName } from "../../api/apiService";
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Đánh giá động
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState(null);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [canReview, setCanReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [user, setUser] = useState(null);
  // State chọn storage
  const [selectedStorage, setSelectedStorage] = useState(null);
  // Sản phẩm liên quan
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch sản phẩm liên quan cùng danh mục
  useEffect(() => {
    if (product && product.categoryId) {
      getProductsByCategory(product.categoryId).then((list) => {
        setRelatedProducts(
          Array.isArray(list) ? list.filter((p) => p.id !== product.id) : []
        );
      });
    }
  }, [product]);

  // Fetch product detail, user
  useEffect(() => {
    fetchProductDetail();
    fetchCurrentUser();
    // eslint-disable-next-line
  }, [id]);

  // Khi đã có product, fetch đánh giá
  useEffect(() => {
    if (product && product.productName) {
      fetchProductReviews(product.productName);
    }
  }, [product]);

  // Hàm fetchProductReviews mới: enrich user info luôn khi lấy review
  async function fetchProductReviews(productName) {
    setReviewLoading(true);
    setReviewError(null);
    try {
      const data = await getProductReviews(productName);
      // enrich user info: lấy firstname, lastname cho từng review
      const enriched = await Promise.all(
        data.map(async (rv) => {
          if (rv.user && rv.user.userName) {
            try {
              let userInfo = await getUserByName(rv.user.userName);
              // Nếu backend trả về mảng, lấy phần tử đầu tiên
              if (Array.isArray(userInfo)) {
                userInfo = userInfo[0];
              }
              if (!userInfo) return rv;
              // Gán trực tiếp firstname, lastname vào rv.user cho tiện render
              return {
                ...rv,
                user: {
                  ...rv.user,
                  firstName: userInfo.firstName,
                  lastName: userInfo.lastName,
                  userDetails: userInfo,
                },
              };
            } catch {
              return rv;
            }
          }
          return rv;
        })
      );
      setReviews(enriched);
    } catch (err) {
      setReviewError("Không thể tải đánh giá sản phẩm.");
    }
    setReviewLoading(false);
  }

  // Lấy chi tiết sản phẩm
  async function fetchProductDetail() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductById(id);
      console.log("Chi tiết sản phẩm trả về:", data);
      setProduct(data);
    } catch (err) {
      setError("Không thể lấy dữ liệu sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  // // Lấy danh sách đánh giá sản phẩm
  // async function fetchProductReviews(productName) {
  //   setReviewLoading(true);
  //   setReviewError(null);
  //   try {
  //     const data = await getProductReviews(productName);
  //     setReviews(Array.isArray(data) ? data : []);
  //   } catch (err) {
  //     setReviewError("Không thể lấy đánh giá sản phẩm.");
  //   } finally {
  //     setReviewLoading(false);
  //   }
  // }

  // Lấy user hiện tại và kiểm tra quyền đánh giá
  async function fetchCurrentUser() {
    try {
      const userInfo = await getAuthUser();
      setUser(userInfo);
      // Kiểm tra quyền đánh giá (giả lập: cho phép nếu đã đăng nhập)
      setCanReview(!!userInfo);
    } catch {
      setUser(null);
      setCanReview(false);
    }
  }

  // Thêm vào giỏ hàng chuẩn Java Spring
  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
        return;
      }
      await addToCart(product.id, quantity); // Dùng service chuẩn Spring
      alert("Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (error) {
      alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/products" className="btn btn-primary">
          Trở lại trang sản phẩm
        </Link>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Sản phẩm không tồn tại.</Alert>
        <Link to="/products" className="btn btn-primary">
          Trở lại trang sản phẩm
        </Link>
      </Container>
    );
  }

  return (
    <div className="container py-4">
      <Helmet>
        <title>{product.productName || "Chi tiết sản phẩm"}</title>
        <meta name="description" content={product.description} />
      </Helmet>
      {/* Breadcrumb và danh mục */}
      <div className="mb-2" style={{ paddingLeft: 2 }}>
        <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-transparent p-0 mb-1" style={{ fontSize: 15 }}>
  <li className="breadcrumb-item">
    <a href="/products" style={{ color: "#b0b4bb" }}>
      Danh mục{" "}
    </a>
  </li>
  <li className="breadcrumb-item">
    <a
      href={`/products?category=${encodeURIComponent(product.categoryName)}`}
      style={{ color: "#6d7eab" }}
    >
      {` ${product.categoryName}`}
    </a>
  </li>
</ol>
        </nav>
        <div
          className="d-flex justify-content-between align-items-center mb-2"
          style={{ width: "100%" }}
        >
          <h1
            style={{
              fontWeight: 700,
              fontSize: 30,
              color: "#333",
              marginBottom: 18,
            }}
          >
            {product.productName}
          </h1>
          {/* Hiển thị số sao trung bình kiểu mẫu */}
          {reviews.length > 0 && (
            <div
              className="d-flex align-items-center"
              style={{ marginLeft: 20 }}
            >
              {(() => {
                const avg =
                  reviews.length > 0
                    ? reviews.reduce((acc, r) => acc + r.rating, 0) /
                      reviews.length
                    : 0;
                const fullStars = Math.floor(avg);
                const hasHalfStar = avg % 1 >= 0.5;
                const stars = [];
                for (let i = 1; i <= 5; i++) {
                  if (i <= fullStars) {
                    stars.push(
                      <i
                        key={i}
                        className="fa fa-star text-warning"
                        style={{
                          color: "#ff9800",
                          fontSize: 22,
                          marginRight: 2,
                        }}
                      />
                    );
                  } else if (i === fullStars + 1 && hasHalfStar) {
                    stars.push(
                      <i
                        key={i}
                        className="fa fa-star-half-o text-warning"
                        style={{
                          color: "#ff9800",
                          fontSize: 22,
                          marginRight: 2,
                        }}
                      />
                    );
                  } else {
                    stars.push(
                      <i
                        key={i}
                        className="fa fa-star-o text-muted"
                        style={{ color: "#ddd", fontSize: 22, marginRight: 2 }}
                      />
                    );
                  }
                }
                return stars;
              })()}
              <span
                style={{
                  marginLeft: 10,
                  color: "#8d5700",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                ({reviews.length} đánh giá)
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="row g-4 flex-wrap">
        {/* Bên trái: Ảnh sản phẩm và mô tả */}
        <div className="col-lg-4 col-md-12 mb-3">
          <div className="card shadow-sm p-3 h-100" style={{ paddingTop: 30 }}>
            <img
              src={
                product.imageUrl
                  ? `http://localhost:8900/api/catalog/images/${product.imageUrl}`
                  : "http://localhost:8900/api/catalog/images/default.png"
              }
              alt={product.productName}
              style={{
                width: "100%",
                height: 280,
                objectFit: "contain",
                borderRadius: 8,
                background: "#fff",
                marginBottom: 15,
              }}
            />
            <div className="text-muted mb-2" style={{ fontSize: 15 }}>
              {product.description}
            </div>
            <ul className="list-unstyled mb-0" style={{ fontSize: 14 }}>
             
              <li>
  <b>{product.availability > 0 ? 'Còn hàng' : 'Hết hàng'}</b> 
</li>
            </ul>
          </div>
        </div>
        {/* Ở giữa: Giá, số lượng, thêm giỏ hàng, khuyến mãi, vận chuyển, hotline */}
        <div className="col-lg-5 col-md-12 mb-3">
          <div
            className="card shadow-lg p-4 h-100"
            style={{
              background: "linear-gradient(135deg, #fff 70%, #f8e8ee 100%)",
              borderRadius: 18,
            }}
          >
            <h2
              style={{
                color: "#d70018",
                fontWeight: 800,
                fontSize: 36,
                letterSpacing: 1,
              }}
            >
              {product.price?.toLocaleString("vi-VN")}{" "}
              <span style={{ fontSize: 20 }}>đ</span>
            </h2>
            <div className="mb-3">
              <span
                className="badge bg-warning text-dark p-2 mr-2 shadow-sm"
                style={{ fontSize: 15, borderRadius: 8 }}
              >
                Trả góp 0%
              </span>
              <span
                className="badge bg-success p-2 shadow-sm"
                style={{ fontSize: 15, borderRadius: 8 }}
              >
                Giảm giá sốc
              </span>
            </div>
            {/* Storage options */}
            {product.storages && product.storages.length > 0 && (
              <div className="mb-3 d-flex">
                {product.storages.map((storage, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedStorage(storage)}
                    style={{
                      minWidth: 90,
                      padding: "8px 20px",
                      border:
                        selectedStorage === storage
                          ? "2px solid #2196f3"
                          : "2px solid #e0e0e0",
                      background:
                        selectedStorage === storage ? "#e3f2fd" : "#fff",
                      color: selectedStorage === storage ? "#2196f3" : "#222",
                      fontWeight: selectedStorage === storage ? 600 : 500,
                      borderRadius: 12,
                      marginRight: 12,
                      fontSize: 17,
                      boxShadow:
                        selectedStorage === storage
                          ? "0 2px 8px #e3f2fd"
                          : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            )}
            {/* Nếu hết hàng thì ẩn input số lượng và nút đặt hàng, thay bằng thông báo */}
            {product.availability > 0 ? (
              <div className="d-flex align-items-center mb-3">
                <input
                  type="number"
                  min={1}
                  max={product.availability || 99}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="form-control mr-2"
                  style={{
                    width: "90px",
                    marginRight: 12,
                    border: "1.5px solid #2196f3",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px #e3f2fd",
                  }}
                />
                <button
                  className="btn btn-outline-primary btn-lg px-4"
                  style={{
                    border: "2px solid #2196f3",
                    color: "#2196f3",
                    fontWeight: 600,
                    borderRadius: 10,
                    background: "#fff",
                    transition: "0.2s",
                    boxShadow: "0 2px 8px #e3f2fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#e3f2fd";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#fff";
                  }}
                  onClick={handleAddToCart}
                >
                  <i
                    className="fa fa-shopping-cart mr-2"
                    style={{ fontSize: 18 }}
                  ></i>{" "}
                  Thêm vào giỏ
                </button>
              </div>
            ) : (
              <div className="alert alert-danger mb-3" style={{fontWeight: 600, fontSize: 17, borderRadius: 10}}>
                Sản phẩm này hiện tại đã hết hàng
              </div>
            )}
            <div className="row mb-3">
              <div className="col-12 col-md-6 mb-2 mb-md-0">
                <div
                  style={{
                    background: "#f1f8ff",
                    borderRadius: 8,
                    padding: 10,
                    borderLeft: "4px solid #4e9cff",
                  }}
                >
                  <i className="fa fa-truck text-primary mr-2"></i>
                  <span style={{ color: "#2471a3", fontWeight: 500 }}>
                    Giao hàng nhanh toàn quốc
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div
                  style={{
                    background: "#f9fff1",
                    borderRadius: 8,
                    padding: 10,
                    borderLeft: "4px solid #2ecc71",
                  }}
                >
                  <i className="fa fa-shield text-success mr-2"></i>
                  <span style={{ color: "#229954", fontWeight: 500 }}>
                    Bảo hành 12 tháng chính hãng
                  </span>
                </div>
              </div>
            </div>
            <div
              className="mb-3"
              style={{
                background: "#fff8e1",
                borderRadius: 8,
                padding: 10,
                borderLeft: "4px solid #ffa726",
              }}
            >
              <i className="fa fa-phone text-warning mr-2"></i>
              <span style={{ color: "#ff9800", fontWeight: 600 }}>
                Hotline: <b>097.120.66.88</b>
              </span>
            </div>
            <div
              className="alert alert-info py-2 px-3 mb-0 shadow-sm"
              style={{
                fontSize: 15,
                background: "#e3f2fd",
                borderRadius: 8,
                border: "none",
              }}
            >
              <b>Ưu đãi:</b>{" "}
              <span style={{ color: "#d70018" }}>
                Tặng dán màn hình, miễn phí vận chuyển nội thành, hỗ trợ đổi trả
                trong 7 ngày.
              </span>
            </div>
          </div>
        </div>
        {/* Bên phải: Sản phẩm liên quan */}
        <div className="col-lg-3 col-md-12 mb-3">
          <div className="card shadow-sm p-3 h-100">
            <h5 className="mb-3" style={{ fontWeight: 700 }}>
              Sản phẩm liên quan
            </h5>
            {relatedProducts.length === 0 ? (
              <div className="text-muted">Không có sản phẩm liên quan.</div>
            ) : (
              <>
                {relatedProducts.slice(0, 4).map((rp) => (
                  <div className="d-flex align-items-center mb-3" key={rp.id}>
                    <img
                      src={
                        rp.imageUrl
                          ? `http://localhost:8900/api/catalog/images/${rp.imageUrl}`
                          : "http://localhost:8900/api/catalog/images/default.png"
                      }
                      alt={rp.productName}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                      }}
                    />
                    <div
                      className="ml-2"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        (window.location.href = `/product-detail/${rp.id}`)
                      }
                    >
                      <div style={{ fontWeight: 600, color: "#222" }}>
                        {rp.productName}
                      </div>
                      <div className="text-danger">
                        {rp.price?.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Đánh giá khách hàng */}
      <div className="row mt-4">
        <div className="col-md-12">
          <h5 className="mb-3" style={{ fontWeight: 700 }}>
            Đánh giá của người dùng về sản phẩm
          </h5>

          {/* Bảng thống kê đánh giá */}
          <div
            className="row"
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 8,
              marginBottom: 24,
              boxShadow: "0 1px 8px #eee",
            }}
          >
            {/* Cột trái: điểm trung bình và tổng đánh giá */}
            <div
              className="col-md-3 d-flex flex-column align-items-center justify-content-center p-3"
              style={{ borderRight: "1px solid #f0f0f0" }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#ff9800",
                  marginBottom: 4,
                }}
              >
                {reviews.length > 0
                  ? (
                      reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
                    ).toFixed(1)
                  : "0"}
                /5
              </div>
              <div style={{ fontSize: 22, marginBottom: 4 }}>
                {(() => {
                  const avg =
                    reviews.length > 0
                      ? reviews.reduce((a, r) => a + r.rating, 0) /
                        reviews.length
                      : 0;
                  const fullStars = Math.floor(avg);
                  const hasHalfStar = avg % 1 >= 0.5;
                  const stars = [];
                  for (let i = 1; i <= 5; i++) {
                    if (i <= fullStars) {
                      stars.push(
                        <i
                          key={i}
                          className="fa fa-star text-warning"
                          style={{ color: "#ff9800", marginRight: 2 }}
                        />
                      );
                    } else if (i === fullStars + 1 && hasHalfStar) {
                      stars.push(
                        <i
                          key={i}
                          className="fa fa-star-half-o text-warning"
                          style={{ color: "#ff9800", marginRight: 2 }}
                        />
                      );
                    } else {
                      stars.push(
                        <i
                          key={i}
                          className="fa fa-star-o text-muted"
                          style={{ color: "#ddd", marginRight: 2 }}
                        />
                      );
                    }
                  }
                  return stars;
                })()}
              </div>
              <div style={{ color: "#444", fontSize: 15 }}>
                {reviews.length} lượt đánh giá
              </div>
            </div>
            {/* Cột giữa: thống kê số lượng sao */}
            <div className="col-md-6 p-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(
                  (r) => Math.round(r.rating) === star
                ).length;
                const percent =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="d-flex align-items-center mb-1">
                    <span style={{ width: 38, fontSize: 15 }}>{star} Sao</span>
                    <div
                      style={{
                        flex: 1,
                        background: "#f5f5f5",
                        height: 10,
                        borderRadius: 5,
                        margin: "0 8px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          background: "#ff9800",
                          height: 10,
                          borderRadius: 5,
                        }}
                      ></div>
                    </div>
                    <span
                      style={{
                        width: 32,
                        textAlign: "right",
                        color: "#888",
                        fontSize: 14,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Cột phải: box hỏi đáp */}
            <div className="col-md-3 d-flex flex-column justify-content-center align-items-center p-3">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Bạn có vấn đề cần tư vấn?
              </div>
              <button
                className="btn"
                style={{
                  background: "#d6a44a",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "7px 22px",
                }}
              >
                Gửi câu hỏi
              </button>
            </div>
          </div>

          {/* Danh sách đánh giá động */}
          {reviewLoading ? (
            <div>Đang tải đánh giá...</div>
          ) : reviewError ? (
            <div className="text-danger">{reviewError}</div>
          ) : reviews.length === 0 ? (
            <div className="alert alert-info">
              Chưa có đánh giá nào cho sản phẩm này.
            </div>
          ) : (
            reviews.map((rv, idx) => {
              // Ẩn số điện thoại: chỉ hiện 4 số cuối nếu có
              const phone = rv.user?.userDetails?.phoneNumber;
              const maskedPhone = phone
                ? phone.replace(/(\d{4})$/, "xxxx$1")
                : "";
              // Ngày đánh giá (giả lập, nếu có trường createdDate thì lấy ra)
              const date = rv.createdDate ? new Date(rv.createdDate) : null;
              // Hiện dãy sao (có nửa sao)
              const stars = [];
              let fullStars = Math.floor(rv.rating);
              let halfStar = rv.rating - fullStars >= 0.5;
              for (let i = 1; i <= 5; i++) {
                if (i <= fullStars) {
                  stars.push(
                    <i
                      key={i}
                      className="fa fa-star"
                      style={{ color: "#ff9800", fontSize: 18, marginRight: 2 }}
                    />
                  );
                } else if (halfStar && i === fullStars + 1) {
                  stars.push(
                    <i
                      key={i}
                      className="fa fa-star-half-o"
                      style={{ color: "#ff9800", fontSize: 18, marginRight: 2 }}
                    />
                  );
                } else {
                  stars.push(
                    <i
                      key={i}
                      className="fa fa-star"
                      style={{ color: "#ddd", fontSize: 18, marginRight: 2 }}
                    />
                  );
                }
              }
              return (
                <div
                  className="card mb-2"
                  key={idx}
                  style={{
                    border: "none",
                    borderBottom: "1px solid #eee",
                    borderRadius: 0,
                  }}
                >
                  <div
                    className="card-body p-3 pb-2"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      background: "#fff",
                    }}
                  >
                    {console.log("DEBUG user review:", rv.user)}
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        background: "#f5f5f5",
                        color: "#ff9800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 22,
                        border: "1.5px solid #ff9800",
                        marginRight: 16,
                        borderRadius: 8,
                        textTransform: "uppercase",
                        boxSizing: "border-box",
                        userSelect: "none",
                      }}
                    >
                      {(() => {
                        const fn1 = rv.user?.firstName;
                        const fn2 = rv.user?.userDetails?.firstName;
                        const fn3 =
                          rv.user?.userDetails?.userDetails?.firstName;
                        console.log("DEBUG AVATAR:", { fn1, fn2, fn3 });
                        if (fn1 && typeof fn1 === "string")
                          return fn1.trim().charAt(0);
                        if (fn2 && typeof fn2 === "string")
                          return fn2.trim().charAt(0);
                        if (fn3 && typeof fn3 === "string")
                          return fn3.trim().charAt(0);
                        return "A";
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 3,
                        }}
                      >
                        <b style={{ fontSize: 16, color: "#222" }}>
                          {rv.user?.firstName ||
                          rv.user?.lastName ||
                          rv.user?.userDetails?.firstName ||
                          rv.user?.userDetails?.lastName ||
                          rv.user?.userDetails?.userDetails?.firstName ||
                          rv.user?.userDetails?.userDetails?.lastName
                            ? `${
                                rv.user.firstName ||
                                rv.user.userDetails?.firstName ||
                                rv.user.userDetails?.userDetails?.firstName ||
                                ""
                              } ${
                                rv.user.lastName ||
                                rv.user.userDetails?.lastName ||
                                rv.user.userDetails?.userDetails?.lastName ||
                                ""
                              }`.trim()
                            : "Ẩn danh"}
                        </b>
                        {maskedPhone && (
                          <span
                            style={{
                              marginLeft: 8,
                              color: "#888",
                              fontSize: 13,
                            }}
                          >
                            {maskedPhone}
                          </span>
                        )}
                        {date && (
                          <span
                            style={{
                              marginLeft: 8,
                              color: "#888",
                              fontSize: 13,
                            }}
                          >
                            {date.toLocaleString("vi-VN")}
                          </span>
                        )}
                        <span
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {stars}
                        </span>
                      </div>
                      <div
                        style={{ color: "#333", fontSize: 15, marginBottom: 2 }}
                      >
                        {rv.comment}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
