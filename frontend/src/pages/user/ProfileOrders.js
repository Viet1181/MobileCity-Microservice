import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getOrdersByUserName,
  getProductReviews,
  deleteProductReview,
  getAuthUser,
  cancelOrder,
  getProductsByName,
} from "../../api/apiService";

// Hàm chuyển trạng thái đơn hàng sang tiếng Việt
function renderOrderStatus(status) {
  switch (status) {
    case "PENDING":
      return "Đang xử lý";
    case "PAID":
      return "Đã thanh toán";
    case "CANCELLED":
      return "Đã hủy";
    case "DELIVERED":
      return "Đã giao hàng";
    case "DELIVERING":
      return "Đang giao hàng";
    case "SHIPPING":
      return "Đang giao";

    default:
      return status || "";
  }
}

const ProfileOrders = () => {
  const [realProductIds, setRealProductIds] = useState({}); // Lưu map {productName: realId}

  // Hàm lấy id thực tế của sản phẩm theo tên
  const fetchRealProductId = async (productName) => {
    const key = productName.trim().toLowerCase();
    if (realProductIds[key]) return realProductIds[key];
    try {
      const products = await getProductsByName(productName);
      if (products && products.length > 0) {
        setRealProductIds((prev) => ({ ...prev, [key]: products[0].id }));
        return products[0].id;
      }
    } catch (e) {}
    return null;
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productReviews, setProductReviews] = useState({});
  const navigate = useNavigate();

  // Hàm lấy danh sách đánh giá sản phẩm, dùng đúng API getProductReviews
  const fetchProductReviews = async (productName) => {
    try {
      // Đảm bảo luôn dùng getProductReviews là API lấy review chính xác
      const reviews = await getProductReviews(productName);
      return reviews || [];
    } catch (error) {
      console.error(`Lỗi khi lấy đánh giá cho sản phẩm ${productName}:`, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userInfo = await getAuthUser();
        if (!userInfo) {
          navigate("/login");
          return;
        }
        const userName = userInfo.userName;
        if (!userName) {
          console.error("Không tìm thấy userName");
          navigate("/login");
          return;
        }
        const response = await getOrdersByUserName(userName);
        const ordersData = response.orders || response.data || [];
        setOrders(ordersData);

        // Lấy đánh giá cho tất cả sản phẩm đã mua
        const reviewsPromises = ordersData
          .filter((order) => order.status === "PAID")
          .flatMap((order) => order.items)
          .map(async (item) => {
            const reviews = await fetchProductReviews(item.product.productName);
            // key chuẩn hóa
            const key = item.product.productName.trim().toLowerCase();
            return { [key]: reviews };
          });

        const reviewsResults = await Promise.all(reviewsPromises);
        const reviewsMap = reviewsResults.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        );
        setProductReviews(reviewsMap);
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng hoặc user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleDeleteReview = async (reviewId, productName) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        await deleteProductReview(reviewId);
        // Cập nhật lại danh sách đánh giá
        const updatedReviews = await fetchProductReviews(productName);
        setProductReviews((prev) => ({
          ...prev,
          [productName]: updatedReviews,
        }));
        alert("Đã xóa đánh giá thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa đánh giá:", error);
        alert("Không thể xóa đánh giá. Vui lòng thử lại sau.");
      }
    }
  };

  const getUserReviewForProduct = (productName, userName) => {
    // key chuẩn hóa
    const key = productName.trim().toLowerCase();
    const reviews = productReviews[key] || [];
    // Log debug để kiểm tra userName và danh sách review
    // console.log('DEBUG: So sánh review cho', key, 'userName:', userName, 'reviews:', reviews);
    return reviews.find((review) => {
      // So sánh userName không phân biệt hoa thường, loại bỏ khoảng trắng thừa
      const reviewName = review.user?.userName?.trim().toLowerCase();
      const checkName = userName?.trim().toLowerCase();
      return reviewName && checkName && reviewName === checkName;
    });
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <section className="section-pagetop bg-gray">
        <div className="container">
          <h2 className="title-page">Đơn hàng của tôi</h2>
        </div>
      </section>
      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            <aside className="col-md-3">
              <nav className="list-group">
                <Link className="list-group-item" to="/profile">
                  Tổng quan tài khoản
                </Link>
                <Link className="list-group-item active" to="/profile/orders">
                  Đơn hàng của tôi
                </Link>
                <Link className="list-group-item" to="/profile/settings">
                  Cài đặt
                </Link>
                <Link
                  className="list-group-item"
                  to="/logout"
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
                      window.location.href = "/logout";
                    }
                  }}
                >
                  Đăng xuất
                </Link>
              </nav>
            </aside>
            <main className="col-md-9">
              {Array.isArray(orders) && orders.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center">
                    <p>Bạn chưa có đơn hàng nào.</p>
                    <Link to="/" className="btn btn-primary">
                      Mua sắm ngay
                    </Link>
                  </div>
                </div>
              ) : Array.isArray(orders) ? (
                [...orders].reverse().map((order) => (
                  <article key={order.id} className="card mb-4">
                    {order.status !== "DELIVERED" &&
                      order.status !== "CANCELLED" &&
                      order.status !== "PAID" && (
                        <button
                          className="btn btn-danger btn-sm float-right"
                          style={{ margin: "10px" }}
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn hủy đơn hàng này?"
                              )
                            ) {
                              try {
                                await cancelOrder(order.id);
                                alert("Đã hủy đơn hàng thành công!");
                                const userInfo = await getAuthUser();
                                if (userInfo?.userName) {
                                  const response = await getOrdersByUserName(
                                    userInfo.userName
                                  );
                                  const ordersData =
                                    response.orders || response.data || [];
                                  setOrders(ordersData);
                                }
                              } catch (err) {
                                alert(
                                  "Không thể hủy đơn hàng. Vui lòng thử lại sau!"
                                );
                              }
                            }
                          }}
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    <header className="card-header">
                      <strong className="d-inline-block mr-3">
                        Mã đơn hàng: {order.id}
                      </strong>
                      <span>
                        Ngày đặt:{" "}
                        {new Date(order.orderedDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                      <span
                        className="float-right"
                        style={{
                          fontWeight: "bold",
                          color: "#222",
                          fontSize: "1rem",
                        }}
                      >
                        {renderOrderStatus(order.status)}
                      </span>
                    </header>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-8">
                          <h6 className="text-muted">Thông tin thanh toán</h6>
                          <p>
                            Tổng tiền:{" "}
                            {order.items
                              .reduce((total, item) => total + item.subTotal, 0)
                              .toLocaleString("vi-VN")}
                            đ
                          </p>
                        </div>
                      </div>
                      <hr />
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <tbody>
                            {order.items.map((item) => {
                              let userName = "";
                              if (typeof window !== "undefined") {
                                try {
                                  const userInfo = JSON.parse(
                                    localStorage.getItem("userInfo")
                                  );
                                  if (userInfo && userInfo.userName)
                                    userName = userInfo.userName;
                                } catch {}
                              }
                              const productKey = item.product.productName
                                .trim()
                                .toLowerCase();
                              const review = getUserReviewForProduct(
                                productKey,
                                userName
                              );
                              return (
                                <tr key={item.product.id}>
                                  <td width="65">
                                    <img
                                      src={`http://localhost:8900/api/catalog/images/${item.product.imageUrl}`}
                                      className="img-xs border"
                                      alt={item.product.productName}
                                      width={150}
                                      height={150}
                                    />
                                  </td>
                                  <td>
                                    <p className="title mb-0">
                                      {item.product.productName}
                                      <ShowProductDetailLink
                                        productName={item.product.productName}
                                      />
                                    </p>
                                    <var className="price text-muted">
                                      {item.product.price.toLocaleString(
                                        "vi-VN"
                                      )}
                                      đ x {item.quantity}
                                    </var>
                                    {order.status === "PAID" ? (
                                      <div className="mt-2">
                                        {review ? (
                                          <div className="d-flex align-items-center">
                                            <div className="mr-2">
                                              Đánh giá của bạn:{" "}
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <i
                                                  key={star}
                                                  className={`fa fa-star ${
                                                    star <= review.rating
                                                      ? "text-warning"
                                                      : "text-muted"
                                                  }`}
                                                />
                                              ))}
                                              {review.comment && (
                                                <small className="text-muted ml-2">
                                                  <em>"{review.comment}"</em>
                                                </small>
                                              )}
                                            </div>
                                            <button
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() =>
                                                handleDeleteReview(
                                                  review.id,
                                                  item.product.productName
                                                )
                                              }
                                            >
                                              <i className="fa fa-trash"></i>
                                            </button>
                                          </div>
                                        ) : (
                                          <Link
                                            to={`/products/review?productName=${encodeURIComponent(
                                              item.product.productName
                                            )}`}
                                            className="btn btn-sm btn-outline-primary"
                                          >
                                            Đánh giá sản phẩm
                                          </Link>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="mt-2">
                                        <span
                                          style={{
                                            fontWeight: "bold",
                                            color: "#222",
                                            fontSize: "1rem",
                                          }}
                                        >
                                          {renderOrderStatus(order.status)}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="text-right">
                                    <strong>
                                      {item.subTotal?.toLocaleString("vi-VN")}đ
                                    </strong>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="card">
                  <div className="card-body text-center">
                    <p>Đã xảy ra lỗi khi lấy danh sách đơn hàng.</p>
                  </div>
                </div>
              )}
              
            </main>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

// Component con để xử lý lấy id thực và tạo link chi tiết
const ShowProductDetailLink = ({ productName }) => {
  const [realId, setRealId] = useState(null);
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const key = productName.trim().toLowerCase();
      // Ưu tiên lấy từ cache của ProfileOrders nếu có
      if (window.__realProductIdsCache && window.__realProductIdsCache[key]) {
        setRealId(window.__realProductIdsCache[key]);
        return;
      }
      // Nếu chưa có, gọi API
      const products = await getProductsByName(productName);
      if (isMounted && products && products.length > 0) {
        setRealId(products[0].id);
        // Cache lại trên window để các lần sau dùng chung (giảm gọi API)
        window.__realProductIdsCache = window.__realProductIdsCache || {};
        window.__realProductIdsCache[key] = products[0].id;
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [productName]);
  if (!realId)
    return <span className="ml-2 text-muted">(không tìm thấy ID thật)</span>;
  return (
    <Link
      to={`/product-detail/${realId}`}
      className="btn btn-sm btn-outline-info ml-2"
      title="Xem chi tiết sản phẩm"
    >
      Xem chi tiết
    </Link>
  );
};

export default ProfileOrders;
