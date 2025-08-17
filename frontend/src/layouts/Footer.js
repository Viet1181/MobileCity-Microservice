import React from "react";
const Footer = () => (
  <footer
    style={{
      backgroundColor: "#e1e1e1",
      padding: "40px 0",
      borderTop: "1px solid #eaeaea",
    }}
  >
    <div className="container">
      <div className="row">
        {/* Store Locations Section */}
        <div className="col-md-4">
          <h4 style={{ color: "#c69a39", marginBottom: "20px" }}>
            HỆ THỐNG CỬA HÀNG
          </h4>
          <ul>
            <li>
              <strong>Quảng Na</strong>
            </li>
            <li>
              120 Thái Hà, Q. Đống Đa | <a href="#">Xem bản đồ</a>
            </li>
            <li>Điện thoại: 0969.120.120 - 037.437.9999</li>
            <li>
              398 Cầu Giấy, Q. Cầu Giấy | <a href="#">Xem bản đồ</a>
            </li>
            <li>Điện thoại: 096.1111.398 - 037.437.9999</li>
            <li>
              42 Phố Vọng, Hai Bà Trưng | <a href="#">Xem bản đồ</a>
            </li>
            <li>Điện thoại: 0979.884.242 - 037.437.9999</li>
          </ul>
          <ul>
            <li>
              <strong>Hồ Chí Minh</strong>
            </li>
            <li>
              123 Trần Quang Khải, Q.1 | <a href="#">Xem bản đồ</a>
            </li>
            <li>Điện thoại: 0965.123.123 - 0969.520.520</li>
            <li>
              602 Lê Hồng Phong, P.10, Q.10 | <a href="#">Xem bản đồ</a>
            </li>
            <li>Điện thoại: 097.1111.602 - 097.3333.602</li>
          </ul>
          <ul>
            <li>
              <strong>Đà Nẵng</strong>
            </li>
            <li>
              97 Hàm Nghi, Q.Thanh Khê | <a href="#">Xem bản đồ</a>
            </li>
            <li>Điện thoại: 096.123.9797 - 097.123.9797</li>
          </ul>
          <p>
            Hotline CSKH: <strong>097.120.66.88</strong>
          </p>
        </div>

        {/* Policies Section */}
        <div className="col-md-4">
          <h4 style={{ color: "#c69a39", marginBottom: "20px" }}>
            QUY ĐỊNH - CHÍNH SÁCH
          </h4>
          <ul>
            <li>
              <a href="#">Chính sách bảo hành</a>
            </li>
            <li>
              <a href="#">Chính sách vận chuyển</a>
            </li>
            <li>
              <a href="#">Chính sách đổi trả hàng</a>
            </li>
            <li>
              <a href="#">Chính sách bảo mật thông tin</a>
            </li>
            <li>
              <a href="#">Hướng dẫn thanh toán</a>
            </li>
            <li>
              <a href="#">Hướng dẫn mua hàng Online</a>
            </li>
            <li>
              <a href="#">Dịch vụ Ship COD Toàn quốc</a>
            </li>
            <li>
              <a href="#">Chính sách đại lý linh, phụ kiện</a>
            </li>
          </ul>
        </div>

        {/* Newsletter & Social Media Links */}
        <div className="col-md-4">
          <h4 style={{ color: "#c69a39", marginBottom: "20px" }}>
            ĐĂNG KÝ NHẬN BẢNG TIN
          </h4>
          <form className="newsletter" style={{ display: "flex" }}>
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="form-control"
              style={{ border: "1px solid #ccc", padding: "8px", flex: "1" }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                backgroundColor: "#c69a39",
                color: "white",
                padding: "8px 20px",
              }}
            >
              Gửi
            </button>
          </form>
          <h4 style={{ color: "#c69a39", marginTop: "20px" }}>LIÊN KẾT</h4>
          <ul className="social-links" style={{ marginTop: "20px" }}>
            <li style={{ display: "inline-block", marginRight: "15px" }}>
              <a href="#">
                <i className="fa fa-facebook"></i> Facebook
              </a>
            </li>
            <li style={{ display: "inline-block", marginRight: "15px" }}>
              <a href="#">
                <i className="fa fa-youtube"></i> Youtube
              </a>
            </li>
            <li style={{ display: "inline-block", marginRight: "15px" }}>
              <a href="#">
                <i className="fa fa-zalo"></i> OA Zalo
              </a>
            </li>
            <li style={{ display: "inline-block", marginRight: "15px" }}>
              <a href="#">
                <i className="fa fa-instagram"></i> Instagram
              </a>
            </li>
            <li style={{ display: "inline-block", marginRight: "15px" }}>
              <a href="#">
                <i className="fa fa-tiktok"></i> Tiktok
              </a>
            </li>
            <li style={{ display: "inline-block", marginRight: "15px" }}>
              <a href="#">
                <i className="fa fa-twitter"></i> Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="row">
        <div
          className="col-md-12 text-center"
          style={{ marginTop: "40px", color: "#666", fontSize: "14px" }}
        >
          <p>
            © 2020 - HỘ KINH DOANH SỬA CHỮA BẢO HÀNH ĐIỆN THOẠI - 120 Thái Hà.
          </p>
          <p>
            Bạn có thể thanh toán với:
            <img src="path_to_visa_logo.png" alt="Visa" />
            <img src="path_to_mastercard_logo.png" alt="MasterCard" />
          </p>
          <p>
            Tư vấn và phát triển bởi: <a href="#">Viet</a>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
