import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProductById, addProductReview, getProductReviews, getAuthUser, getOrdersByUserName, searchProducts } from '../../api/apiService';

const ReviewProduct = () => {
  const [searchParams] = useSearchParams();
  const productIdFromURL = searchParams.get('productId');
  const productNameFromURL = searchParams.get('productName');
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  // Định nghĩa productId để dùng nhất quán
  const [resolvedProductId, setResolvedProductId] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kiểm tra đăng nhập
        const user = await getAuthUser();
        if (!user) {
          navigate('/login');
          return;
        }
        const userName = user.userName;
        const userId = user.userId || user.id;

        let productData = null;
        let resolvedId = productIdFromURL;
        // Nếu có productId trên URL, lấy trực tiếp
        if (productIdFromURL) {
          productData = await getProductById(productIdFromURL);
        } else if (productNameFromURL) {
          // Nếu không có productId, nhưng có productName, tìm theo tên
          const searchResults = await searchProducts({ name: productNameFromURL });
          if (Array.isArray(searchResults) && searchResults.length > 0) {
            productData = searchResults[0];
            resolvedId = productData.id;
          } else {
            setError('Không tìm thấy mã sản phẩm');
            setLoading(false);
            return;
          }
        } else {
          setError('Không tìm thấy mã sản phẩm');
          setLoading(false);
          return;
        }
        setProduct(productData);
        setResolvedProductId(resolvedId);

        // Lấy danh sách đơn hàng đã thanh toán của user
        const ordersRes = await getOrdersByUserName(userName);
        const orders = ordersRes.orders || ordersRes.data || [];
        // Kiểm tra user đã từng mua (và đã thanh toán) sản phẩm này chưa
        const hasPaidOrder = orders.some(order =>
          order.status === "PAID" &&
          order.items.some(item => String(item.product.id) === String(resolvedId))
        );
        if (!hasPaidOrder) {
          setError('Bạn chỉ có thể đánh giá sản phẩm đã mua và đã thanh toán.');
          setLoading(false);
          return;
        }

        // Lấy đánh giá sản phẩm
        const reviews = await getProductReviews(productData.productName);
        // Tìm đánh giá của người dùng
        const userReview = reviews.find(review => {
          const reviewUserName = review.userName || review.user?.userName || review.userId;
          return reviewUserName === userName || reviewUserName === userId;
        });
        if (userReview) {
          alert('Bạn đã đánh giá sản phẩm này rồi!');
          navigate('/profile/orders');
          return;
        }

      } catch (error) {
        console.error('Chi tiết lỗi:', error);
        setError('Không thể lấy thông tin. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (productIdFromURL || productNameFromURL) {
      fetchData();
    } else {
      setError('Không tìm thấy mã sản phẩm');
      setLoading(false);
    }
  }, [productIdFromURL, productNameFromURL, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      // Lấy user hiện tại
      const user = await getAuthUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const userName = user.userName;
      const userId = user.userId || user.id;

      // Kiểm tra lại đơn hàng đã thanh toán
      const ordersRes = await getOrdersByUserName(userName);
      const orders = ordersRes.orders || ordersRes.data || [];
      const hasPaidOrder = orders.some(order =>
        order.status === "PAID" &&
        order.items.some(item => String(item.product.id) === String(resolvedProductId))
      );
      if (!hasPaidOrder) {
        alert('Bạn chỉ có thể đánh giá sản phẩm đã mua và đã thanh toán.');
        return;
      }

      // Kiểm tra lại đã đánh giá chưa
      const reviews = await getProductReviews(product.productName);
      const userReview = reviews.find(review => {
        const reviewUserName = review.userName || review.user?.userName || review.userId;
        return reviewUserName === userName || reviewUserName === userId;
      });
      if (userReview) {
        alert('Bạn đã đánh giá sản phẩm này rồi!');
        navigate('/profile/orders');
        return;
      }

      await addProductReview(userId, resolvedProductId, rating, comment);
      alert('Đánh giá sản phẩm thành công!');
      navigate('/profile/orders');
    } catch (error) {
      console.error('Chi tiết lỗi khi gửi đánh giá:', error);
      alert('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    }
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

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="section-pagetop bg-gray">
        <div className="container">
          <h2 className="title-page">Đánh giá sản phẩm</h2>
        </div>
      </section>

      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="card">
                <div className="card-body">
                  {product && (
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <img
                          src={`http://localhost:8900/api/catalog/images/${product.imageUrl}`}
                          className="img-fluid"
                          alt={product.productName}
                        />
                      </div>
                      <div className="col-md-9">
                        <h5 className="card-title">{product.productName}</h5>
                        <p className="text-muted">
                          Giá: {product.price?.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Đánh giá của bạn</label>
                      <div className="rating-stars mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fa fa-star fa-2x ${
                              star <= (hoveredRating || rating) ? 'text-warning' : 'text-muted'
                            }`}
                            style={{ cursor: 'pointer', marginRight: '5px' }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Nhận xét của bạn (không bắt buộc)</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      />
                    </div>

                    <div className="text-center">
                      <button type="submit" className="btn btn-primary">
                        Gửi đánh giá
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary ml-2"
                        onClick={() => navigate('/profile/orders')}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ReviewProduct;
