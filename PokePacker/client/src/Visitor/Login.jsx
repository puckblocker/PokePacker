import { useState } from "react";

function Login() {
  // VARIABLES
  const [time, setTime] = useState({});
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  // SEND USER INFO TO BACKEND
  async function sendLoginInfo() {
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
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  return (
    <div>
      <h1> Login Page </h1>
      {/* CREATE ACCOUNT INFO */}
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
      <button onClick={() => sendLoginInfo()}>Login</button>
    </div>
  );
}

export default Login;
