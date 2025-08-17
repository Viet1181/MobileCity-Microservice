import React from "react";
import { Link } from "react-router-dom";
import "../../assets/css/product.css";

function ProductItem({ product }) {
  return (
    <div className="custom-col mb-4">
      <div className="card h-100">
        <img
          className="img-fluid card-img-top mt-2"
          src={`http://localhost:8900/api/catalog/images/${product.imageUrl}`}
          onError={(e) => { e.target.src = "/default-image.jpg"; }}
          alt={product.productName}
          style={{ height: "auto", width: "100%", objectFit: "cover" }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.productName}</h5>

          <div className="product-prices">
            <span className="price-sale">{product.price} VND</span>
          </div>

          {/* <div className="product-description mt-2">
            <small className="text-muted">{product.description || product.discription || ''}</small>
          </div> */}
          {/* <div className="product-category mt-1">
            <span className="badge badge-info">{product.category}</span>
          </div> */}
          {/* <div className="product-availability mt-1">
            <small>Còn lại: {product.availability}</small>
          </div> */}

          <Link to={`/product-detail/${product.id}`} className="buy mt-2">
            Xem chi tiết
          </Link>
          <p className="mt-1">Tặng: miễn phí BHV lần thứ 5, khi đã mua BHV lần thứ 4.</p>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
