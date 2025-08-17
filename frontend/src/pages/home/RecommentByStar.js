import React, { useState, useEffect } from 'react';
import { searchProducts, getProductReviews } from '../../api/apiService';
import { Link } from 'react-router-dom';
import item1 from '../../assets/images/img/realme-gt-neo-5-5g.png';

const RecommentByStar = () => {
  const [bestRatedProducts, setBestRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Lấy tất cả sản phẩm
        const allProducts = await searchProducts({});
        // Lấy đánh giá và tính toán cho mỗi sản phẩm
        const productsWithRatings = await Promise.all(
          allProducts.map(async (product) => {
            const reviews = await getProductReviews(product.productName);
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
            return {
              ...product,
              averageRating,
              reviewCount: reviews.length
            };
          })
        );
        // Sắp xếp theo điểm đánh giá cao nhất
        const topRated = [...productsWithRatings]
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 4);
        setBestRatedProducts(topRated);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fa fa-star text-warning"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fa fa-star-half-o text-warning"></i>);
      } else {
        stars.push(<i key={i} className="fa fa-star-o text-muted"></i>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center">Sản phẩm được đánh giá cao</h2>
      <div className="row">
        {bestRatedProducts.length > 0 ? (
          bestRatedProducts
            .filter(
              (product) =>
                product &&
                typeof product.id !== "undefined" &&
                product.id !== null
            )
            .map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                <Link to={`/product-detail/${product.id}`} className="text-decoration-none">
                  <div className="card h-100">
                    <img
                      className="card-img-top p-3"
                      style={{height: '180px', objectFit: 'contain'}}
                      src={`http://localhost:8900/api/catalog/images/${product.imageUrl}`}
                      onError={(e) => { e.target.src = item1; }}
                      alt={product.productName}
                    />
                    <div className="card-body">
                      <h6 className="card-title text-dark">{product.productName}</h6>
                      <div className="rating-wrap mb-2">
                        <div className="stars">
                          {renderStars(product.averageRating)}
                        </div>
                        <small className="text-muted ms-2">
                          ({product.averageRating.toFixed(1)})
                        </small>
                      </div>
                      <p className="text-muted mb-0">
                        <i className="fa fa-comment"></i> {product.reviewCount} đánh giá
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
        ) : (
          <p>Không có sản phẩm nào</p>
        )}
      </div>
      <div className="text-center mt-4">
        <button
          className="btn btn-outline-warning btn-lg "
          onClick={() => window.location.href = '/products'}
        >
          Xem thêm điện thoại
        </button>
      </div>
    </div>
  );
};

export default RecommentByStar;
