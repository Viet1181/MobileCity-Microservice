import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from "./Header";
import Footer from "./Footer";

const Main = () => (
  <main>
    <div>
      <Header />
      <Outlet  /> {/* This will render the child components */}
      <Footer />
    </div>
  </main>
);

export default Main;
