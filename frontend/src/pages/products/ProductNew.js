import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import "../../assets/css/product.css";
import { getAllProducts } from "../../api/apiService";

const ProductNew = ({ categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        // Nếu muốn lấy top 8 sản phẩm mới nhất, sắp xếp theo createdAt (nếu có)
        // const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(data.slice(-5).reverse());
        // setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-center">Sản Phẩm Mới Nhất</h2>
      <div className="row">
        {products.length > 0 ? (
          products
            .filter(
              (product) =>
                product &&
                typeof product.id !== "undefined" &&
                product.id !== null
            )
            .map((product) => (
              <ProductItem key={product.id} product={product} />
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

export default ProductNew;
