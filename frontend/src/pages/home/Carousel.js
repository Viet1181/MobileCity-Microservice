import React, { Component } from "react";
import ProductNew from "../products/ProductNew";
import RecommentByStar from "./RecommentByStar";
import HomeIntroBanner from "./HomeIntroBanner";

class Carousel extends Component {
  render() {
    return (
      <div>
    
        <ProductNew />
        <RecommentByStar />
            <HomeIntroBanner />
      </div>
    );
  }
}

export default Carousel;
