import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from "./Visitor/CreateAccount.jsx";
import VisitorHome from "./Visitor/VisitorHome.jsx";
import Login from "./Visitor/Login.jsx";
import BuyerHome from "./Buyer/BuyerHome.jsx";
import SellerHome from "./Seller/SellerHome.jsx";
import AdminHome from "./Admin/AdminHome.jsx";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VisitorHome />} />
          <Route path="/visitor/register" element={<CreateAccount />} />
          <Route path="/visitor/login" element={<Login />} />
          <Route path="/buyer/home" element={<BuyerHome />} />
          <Route path="/seller/home" element={<SellerHome />} />
          <Route path="/admin/home" element={<AdminHome />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
