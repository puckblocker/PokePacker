import { useState } from "react";
import { Link } from "react-router-dom";

function VisitorHome() {
  const [time, setTime] = useState({});

  return (
    <div>
      <h1> Welcome to PokéPacker! </h1>
      <Link to="/visitor/register">
        <button>Create Account</button>
      </Link>
    </div>
  );
}

export default VisitorHome;
