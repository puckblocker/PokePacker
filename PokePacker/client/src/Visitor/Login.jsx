import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  // VARIABLES
  const [time, setTime] = useState({});
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // LOGIN INFO BACKEND FRONTEND INTERACTION
  async function handleLoginForm(event) {
    event.preventDefault();

    // PACKAGE INFO
    const userData = {
      userName: userName,
      password: password,
    };

    // SEND USER INFO TO BACKEND
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/loginUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        },
      );
      // GRAB TOKEN
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login Failed.");
        return;
      }

      // STORE TOKEN LOCALLY (WILL CHANGE METHOD EVENTUALLY)
      if (response.ok) {
        localStorage.setItem("packer_token", data.token);
        localStorage.setItem("packer_type", data.type); // save account type
        localStorage.setItem("packer_id", data.id);
        localStorage.setItem("packer_status", data.status);

        console.log("Token Saved.");

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
      } else {
        console.error("Token Failed To Save: ", data.message);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  return (
    <div>
      <h1> Login Page </h1>
      {/* CREATE ACCOUNT INFO */}
      <form onSubmit={handleLoginForm}>
        <label>Username: </label>
        <input
          type="text"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
        ></input>
        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        ></input>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
