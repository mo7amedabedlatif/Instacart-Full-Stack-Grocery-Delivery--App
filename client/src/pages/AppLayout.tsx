import React from "react";
import { Outlet } from "react-router-dom";

import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartSidebar from "../components/CartSidebar";
import { useCart } from "../context/CartContext";

const AppLayout = () => {
  const { cartCount } = useCart();

  return (
    <>
      <Banner />
      <Navbar cartCount={cartCount} />

      <main className="min-h-screen">
        <Outlet />
      </main>

      <Footer />
      <CartSidebar />
    </>
  );
};

export default AppLayout;
