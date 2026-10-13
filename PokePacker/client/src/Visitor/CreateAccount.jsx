import { useState } from "react";

function CreateAccount() {
  // VARIABLES
  const [time, setTime] = useState({});
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SEND USER INFO TO BACKEND
  async function sendUserInfo() {
    // PACKAGE INFO
    const userData = {
      userName: userName,
      email: email,
      password: password,
    };

    // SEND USER INFO TO BACKEND
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/createUser`,
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
      <h1> Create an Account! </h1>
      {/* CREATE ACCOUNT INFO */}
      <label>Username: </label>
      <input
        type="text"
        value={userName}
        onChange={(event) => setUserName(event.target.value)}
      ></input>
      <label>Email: </label>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      ></input>
      <label>Password: </label>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      ></input>
      <button onClick={() => sendUserInfo()}>Create Account</button>
    </div>
  );
}

export default CreateAccount;
