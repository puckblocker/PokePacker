import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function VisitorHome() {
  const [time, setTime] = useState({});
  const navigate = useNavigate();

  // CHECK FOR LOGGED IN USER
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("packer_token");

      // CHECK FOR VISITOR
      if (!token) return;

      // VERIFY TOKEN
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/verifyToken`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // VALID TOKEN
        if (response.ok) {
          const userType = localStorage.getItem("packer_type");

          // SETUP DESTINATIONS
          const routes = {
            buyer: "/buyer/home",
            seller: "/seller/home",
            admin: "/admin/home",
          };

          // SEND TO HOME PAGE
          const dest = routes[userType] || "/";
          navigate(dest);
        }
        // INVALID TOKEN
        else {
          localStorage.removeItem("packer_token");
          localStorage.removeItem("packer_type");
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    };

    checkToken();
  }, []);

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
