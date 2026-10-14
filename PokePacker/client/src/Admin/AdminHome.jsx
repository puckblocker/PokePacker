import { useEffect, useState } from "react";

function AdminHome() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getPendingUsers();
  }, []);
  
//Loads accounts waiting for approval by importing from the backend
   async function getPendingUsers(){
      try{
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/pending-users`
       );
       if (!response.ok){
        throw new Error("Not loading pending accounts")
       }
       const users = await response.json();
       setPendingUsers(users);
      } catch(err){
        setError(err.message);
      }
    }

//Approves or rejects an account depending on what admin clicks
async function handleDecision(userId, decision) {
  setError("");
  setMessage("");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/${decision}-user/${userId}`,
      {
        method: decision === "approve" ? "PATCH" : "DELETE",
      }
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed action");
    }

    setMessage(result.message);
    await getPendingUsers();
  } catch (err) {
    setError(err.message);
  }
}

//UI
  return (
    <div>
      <h1> Welcome to PokéPacker! (Admin) </h1>

      <h2>Accounts Awaiting Approval..</h2>
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
      {!error && pendingUsers.length === 0 && (
        <p>No accounts are awaiting approval</p>
      )}

      {pendingUsers.length>0 &&(
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Account Type</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.type}</td>
                <td>{user.status}</td>
                <td>
                  <button
                  onClick={() => handleDecision(user.id,"approve")}
                  >
                    Approve
                  </button>

                  <button
                  onClick={() => handleDecision(user.id,"reject")}
                  >
                    Reject
                  </button>                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminHome;
