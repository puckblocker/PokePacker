import { useState } from "react";

function CreateAccount() {
  // VARIABLES
  const [time, setTime] = useState({});
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SEND USER INFO TO BACKEND
  async function handleUserForm(event) {
    // PREVENT PAGE REFRESH
    event.preventDefault();

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
      <form onSubmit={handleUserForm}>
        <label htmlFor="username">Username: </label>
        <input
          id="username"
          type="text"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
        />
        <label htmlFor="email">Email: </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="password">Password: </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default CreateAccount;
