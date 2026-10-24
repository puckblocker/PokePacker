import { useState } from "react";
import { Link } from "react-router-dom";

function BuyerHome() {
  const [time, setTime] = useState({});

  return (
    <div>
      <h1> Welcome to PokéPacker! (Buyer) </h1>
      <Link to="/buyer/cart">
    <button>See My Cart</button>
      </Link>
    
      <Link to="/buyer/account">
        <button>Account Management</button>
      </Link>
    </div>
  );
}

export default BuyerHome;
