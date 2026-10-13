import { useState } from "react";
import { Link } from "react-router-dom";

function AdminHome() {
  const [time, setTime] = useState({});

  return (
    <div>
      <h1> Welcome to PokéPacker! (Admin) </h1>
    </div>
  );
}

export default AdminHome;
