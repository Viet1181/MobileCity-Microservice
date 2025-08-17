import React from "react";
import Carousel from "../pages/home/Carousel";
import Slide from "./Slide";

function Home(props) {
  return (
    <div>
      <Slide />
      <Carousel title="Sản Phẩm" id="1" />
    </div>
  );
}

export default Home;
