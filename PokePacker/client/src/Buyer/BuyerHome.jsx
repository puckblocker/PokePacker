import { useState } from "react";
import { useNavigate } from "react-router-dom";

function BuyerHome() {
  const [searchParams, setSearchParams] = useState("");
  const navigate = useNavigate();

  // HANDLE SEARCH FORM
  function handleSearchForm(event) {
    event.preventDefault();

    // PASS SEARCH PARAMS THROUGH URL & SEND USER TO NEW PAGE
    navigate(`/results?q=${searchParams}`);
  }

  return (
    <div>
      <h1> Welcome to PokéPacker! (Buyer) </h1>
      <form onSubmit={handleSearchForm}>
        <input
          type="search"
          value={searchParams}
          placeholder="Search..."
          onChange={(event) => setSearchParams(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
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
