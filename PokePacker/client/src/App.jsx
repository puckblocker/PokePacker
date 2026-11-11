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
import Cart from "./Cart";
import AccountManagement from "./AccountManagement";
import SupportTickets from "./Admin/SupportTickets.jsx";
import CreateTicket from "./CreateTicket.jsx";

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
          <Route path="/seller/home" element={<SellerHome />} />
          <Route
            path="/seller/listing"
            element={<CreateListing />}
          />
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/buyer/cart" element={<Cart />} />
          <Route path="/buyer/account" element={<AccountManagement />} />
          <Route path="/seller/account" element={<AccountManagement />} />
          <Route path="/admin/support-tickets" element={<SupportTickets />} />
          <Route path="/buyer/create-ticket" element={<CreateTicket />} />
          <Route path="/seller/create-ticket" element={<CreateTicket />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
