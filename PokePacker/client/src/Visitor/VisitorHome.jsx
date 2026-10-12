import { useState } from "react";
import { Link } from "react-router-dom";

function VisitorHome() {
  const [time, setTime] = useState({});

  return (
    <div>
      <h1> Welcome to PokéPacker! (Visitor) </h1>
      <Link to="/visitor/register">
        <button>Create Account</button>
      </Link>
      <Link to="/visitor/login">
        <button>Login</button>
      </Link>
    </div>
  );
}

export default VisitorHome;
