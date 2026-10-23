import { useState } from "react";
import { Link } from "react-router-dom";

function BuyerHome() {
  const [time, setTime] = useState({});

  return (
    <div>
      <h1> Welcome to PokéPacker! (Buyer) </h1>
      <form role="search" action="/listings" method="get">
        <label for="query"></label>
        <input type="search" id="query" name="q" placeholder="Search..." />
        <button type="submit">Search</button>
      </form>
    </div>
  );
}

export default BuyerHome;
