import React from "react";
import Slider from "react-slick";

const Slide = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const images = [
    "https://cdn.mobilecity.vn/mobilecity-vn/images/2024/01/w800/1-banner-gioi-thieu-day-nghe-sua-dien-thoai-mobilecity.jpg.webp",
    "https://cdn.mobilecity.vn/mobilecity-vn/images/2024/08/w800/banner-ipad.jpg.webp",
    "https://cdn.mobilecity.vn/mobilecity-vn/images/2024/07/w800/xiaomi-13-banner-slide-mobilecity.jpg.webp",
  ];

  return (
    <div class="container" >
      <div class="row">
        <div class="col-md-8">
          <Slider {...{ ...settings, dots: false }}>
            {images.map((img, index) => (
              <div key={index}>
                <img
                  src={img}
                  alt={`Slide ${index}`}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            ))}
          </Slider>
        </div>
        <div className="col-md-4">
          <ul
            id="slider_video_home"
            className="row"
            style={{ padding: 0, listStyleType: "none" }}
          >
            <li
              id="video"
              data-iframe="https://www.youtube.com/watch?v=xhL3idGzcjU&t=30s"
              data-title="Xiaomi 15 Pro đạt chứng nhận 3C"
              style={{
                display: "inline-block",
                verticalAlign: "top",
                width: "100%",
             
              }}
            >
              <iframe
                src="https://www.youtube.com/embed/XKTXinNyWI0?si=uNz3YI8erkeE6UA2&autoplay=1"
                frameBorder="0"
                allowFullScreen
                title="Đánh giá Redmi K70 Pro: Siêu mạnh trong tầm giá"
                style={{ width: "100%" }}
              ></iframe>
            </li>
            <li
              data-iframe="https://www.youtube.com/watch?v=xhL3idGzcjU&t=30s"
              data-title="Xiaomi 15 Pro đạt chứng nhận 3C"
              style={{ display: "inline-block", width: "32%" }}
            >
              <img
                loading="lazy"
                src="https://img.youtube.com/vi/xhL3idGzcjU/2.jpg"
                alt="Video MobileCity"
                style={{ width: "100%" }} // Điều chỉnh kích thước nếu cần
              />
            </li>
            <li
              data-iframe="https://youtu.be/JYkyCh3EHS0"
              data-title="Rò rỉ cực HOT: Xiaomi 15 Ultra - Siêu phẩm công nghệ khiến giới công nghệ"
              style={{ display: "inline-block", width: "32%" }}
            >
              <img
                loading="lazy"
                src="https://img.youtube.com/vi/JYkyCh3EHS0/2.jpg"
                alt="Video MobileCity"
                style={{ width: "100%" }}
              />
            </li>
            <li
              data-iframe="https://www.youtube.com/watch?v=lvKTRpM4gKA"
              data-title="Đánh giá Redmi K70 Pro: Siêu mạnh trong tầm giá"
              style={{ display: "inline-block", width: "32%" }}
            >
              <img
                loading="lazy"
                src="https://img.youtube.com/vi/lvKTRpM4gKA/2.jpg"
                alt="Video MobileCity"
                style={{ width: "100%" }}
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Slide;
