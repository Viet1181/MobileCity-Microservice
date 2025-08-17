import "./assets/sass/app.scss";
import Main from "./layouts/Main";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import ShoppingCart from "./pages/cart/ShoppingCart";


import Auth from "./pages/auth/Login";

import Home from "./layouts/Home";
import ProductDetail from "./pages/products/ProductDetail";

import ProductListPage from "./pages/products/ProductListPage";
import "react-toastify/dist/ReactToastify.css";

import PlaceOrder from "./pages/cart/PlaceOrder";


import { ToastContainer } from "react-toastify";

import PaymentSuccess from "./pages/checkout/PaymentSuccess";
import PaymentResult from "./pages/checkout/PaymentResult";
import PaymentCancel from "./pages/checkout/PaymentCancel";

import Profile from "./pages/user/Profile";
import ProfileOrders from "./pages/user/ProfileOrders";
import ProfileSettings from "./pages/user/ProfileSettings";
import ReviewProduct from "./pages/cart/ReviewProduct";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Main layout route */}
        <Route path="/" element={<Main />}>
          {/* These routes will be rendered inside the Main layout */}
          <Route path="/" element={<Home />} /> {/* Home page */}
          <Route path="product-detail/:id" element={<ProductDetail />} />
          <Route path="/shopping-cart" element={<ShoppingCart />} />
          <Route path="/products" element={<ProductListPage />} />
        
          <Route path="/dat-hang" element={<PlaceOrder />} />
        
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          {/* Đã sửa ở đây */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/orders" element={<ProfileOrders />} />
     
          <Route path="/profile/settings" element={<ProfileSettings />} />
          <Route path="/products/review" element={<ReviewProduct />} />

        </Route>

        <Route path="/login" element={<Auth />} />
      </Routes>
    </>
  );
}

export default App;
