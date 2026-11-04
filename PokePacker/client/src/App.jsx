import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from "./Visitor/CreateAccount.jsx";
import VisitorHome from "./Visitor/VisitorHome.jsx";
import Login from "./Visitor/Login.jsx";
import BuyerHome from "./Buyer/BuyerHome.jsx";
import SellerHome from "./Seller/SellerHome.jsx";
import AdminHome from "./Admin/AdminHome.jsx";
import CreateListing from "./Seller/CreateListing.jsx";
import SearchResults from "./Buyer/SearchResults.jsx";
import ShowItem from "./Buyer/ItemDetails.jsx";
import Checkout from "./Buyer/CheckOut.jsx";
import Cart from "./Cart";
import AccountManagement from "./AccountManagement";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VisitorHome />} />
          <Route path="/visitor/register" element={<CreateAccount />} />
          <Route path="/visitor/login" element={<Login />} />
          <Route path="/buyer/home" element={<BuyerHome />} />
          <Route path="results" element={<SearchResults />} />
          <Route path="item/:id" element={<ShowItem />} />
          <Route path="/seller/home" element={<SellerHome seller_id={1} />} />
          <Route
            path="/seller/listing"
            element={<CreateListing seller_id={1} />}
          />
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/buyer/cart" element={<Cart />} />
          <Route path="/buyer/account" element={<AccountManagement />} />
          <Route path="/buyer/checkout" element={<Checkout />} />
          <Route path="/seller/account" element={<AccountManagement />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
