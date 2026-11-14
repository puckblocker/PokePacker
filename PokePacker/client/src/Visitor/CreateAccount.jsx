import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateAccount() {
  // VARIABLES
  const [time, setTime] = useState({});
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        }
      );

      if (!response.ok) {
        throw new Error("Could not create account. Please try again.");
      }

      setMessage(
        "Account created successfully! You must now await admin approval before you can log in."
      );

      setUserName("");
      setEmail("");
      setPassword("");

    } catch (error) {
      console.error("Error: ", error);
      setError(error.message);
    }
  }

  return (
    <div>
      <h1> Create an Account! </h1>
      <button type="button" onClick={() => navigate("/")}>
        Back to Visitor Page
      </button>
<br />
      {/* CREATE ACCOUNT INFO */}
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
      <form onSubmit={handleUserForm}>
        <label htmlFor="username">Username: </label>
        <input
          id="username"
          type="text"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          required
        />
        <label htmlFor="email">Email: </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="password">Password: </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default CreateAccount;
