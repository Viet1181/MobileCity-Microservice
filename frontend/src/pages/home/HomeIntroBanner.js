import React from 'react';
import banner1 from '../../assets/images/img/cua-hang-dien-thoai-3.jpg'; // Đổi đường dẫn banner thực tế nếu có
import banner2 from '../../assets/images/img/cua-hang-dien-thoai-5.jpg';
import banner3 from '../../assets/images/img/cua-hang-dien-thoai-1.jpg';


const HomeIntroBanner = () => (
  <>
    {/* Phần giới thiệu */}
    <div className="container mt-5">
      <div className="row align-items-center">
        <div className="col-md-6 mb-4 mb-md-0">
          <h1 className="fw-bold text-warning mb-3">MobileCity - Hệ thống bán lẻ điện thoại, phụ kiện, thiết bị công nghệ chính hãng</h1>
          <p className="lead">
            Được thành lập từ năm 2014, MobileCity tự hào là một trong những chuỗi cửa hàng điện thoại uy tín với đa dạng sản phẩm và dịch vụ chất lượng. Hệ thống chúng tôi luôn đặt trải nghiệm khách hàng lên hàng đầu với nhiều ưu đãi, hậu mãi hấp dẫn và dịch vụ sửa chữa chuyên nghiệp.
          </p>
          <ul>
            <li>Hơn 10 năm kinh nghiệm thị trường smartphone</li>
            <li>Đa dạng sản phẩm: iPhone, Samsung, Xiaomi, Realme, ...</li>
            <li>Hỗ trợ trả góp, bảo hành 1 đổi 1, hậu mãi tận tâm</li>
          </ul>
        </div>
        <div className="col-md-6 text-center">
          <img src={banner2} alt="Showroom MobileCity" className="img-fluid rounded shadow" style={{maxHeight: 320}} />
        </div>
      </div>
    </div>
    {/* Banner quảng cáo */}
    <div className="container mt-4">
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <img src={banner2} alt="Ưu đãi 1" className="img-fluid rounded w-100" />
        </div>
       
        <div className="col-12 col-md-4">
          <img src={banner1} alt="Ưu đãi 3" className="img-fluid rounded w-100" />
        </div>
        <div className="col-12 col-md-4">
          <img src={banner3} alt="Ưu đãi 3" className="img-fluid rounded w-100" />
        </div>
      </div>
    </div>
  </>
);

export default HomeIntroBanner;
