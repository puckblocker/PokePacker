import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminHome() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingListings, setPendingListings] =useState([]);
  const [listingError, setListingError] = useState("");
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [denialReason, setDenialReason] = useState("");
  useEffect(() => {
    getPendingUsers();
    getPendingListings();
  }, []);
  
//LOADS ACCOUNTS PENDING APPROVAL/DENIAL FROM THE BACKEND
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

// LOADS PENDING LISTINGS FROM THE BACKEND
async function getPendingListings(){
  try{
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/pending-listings`
      );
      if (!response.ok){
        throw new Error("Could not load pending listings");
      }

      const listings = await response.json();
      setPendingListings(listings);
      setListingError("");
  } catch (err){
    setListingError(err.message);
  }
}

//HANDLES ADMIN APPROVAL OR DENIAL FOR A USER ACCOUNT
async function handleDecision(userId, decision) {
    setError("");
  setMessage("");

  //ADMIN DENIAL: GETS THE PROMPT FOR THE ADMIN TO GIVE REASONING FOR USER DENIAL
  if (decision === "reject") {
    setRejectingUserId(userId);
    setDenialReason("");
    return;
  }

  //ADMIN APPROVAL: IMMEDIATELY ALLOWS USER ONTO THE SITE
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/${decision}-user/${userId}`,
      {
        method: "PATCH",
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

//ADMIN REJECTION SUBMISSION SO THAT THE USER MAY SEE REASOINING FOR DENIAL
async function submitRejection() {
  if (!denialReason.trim()) {
    setError("A reason is required to deny an account.");
    return;
  }

  setError("");
  setMessage("");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/reject-user/${rejectingUserId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        //SENDS REASONING TO BACKEND TO SAVE IT WITH THE DENIED ACCOUNT
        body: JSON.stringify({ reason: denialReason }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to deny account");
    }

    setMessage(result.message);
    setRejectingUserId(null);
    setDenialReason("");
    await getPendingUsers();
  } catch (err) {
    setError(err.message);
  }
}

//APPROVING OR REJECTION OF A LISTING
async function handleListingDecision(listingId, decision){
  setListingError("");
  setError("");
  setMessage("");

  try{
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/${decision}-listing/${listingId}`,
    {
      method: "PATCH",
    }
    );
  const result = await response.json();

  if(!response.ok){
    throw new Error(result.message ||"Failed to update listings");
  }
  setMessage(result.message);
  await getPendingListings();
  }catch(err){
    setListingError(err.message);
  }
}

//UI
  return (
    <div>
      <h1> Welcome to PokéPacker! (Admin) </h1>

      <Link to="/admin/support-tickets">
        <button>View Support Tickets</button>
      </Link>

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
                  {rejectingUserId === user.id && (
  <div>
    <label>Reason for denial:</label>
    <input
      type="text"
      value={denialReason}
      onChange={(event) => setDenialReason(event.target.value)}
      placeholder="Enter reason"
    />
    <button onClick={submitRejection}>
      Confirm Rejection
    </button>
    <button
      onClick={() => {
        setRejectingUserId(null);
        setDenialReason("");
        setError("");
      }}
    >
      Cancel
    </button>
  </div>
)}               
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2>Listings Awaiting Approval</h2>

{listingError && <p>{listingError}</p>}

{pendingListings.length === 0 && !listingError && (
  <p>No listings are awaiting approval</p>
)}

{pendingListings.length > 0 && (
  <table>
    <thead>
      <tr>
        <th>Listing Name</th>
        <th>Quantity</th>
        <th>Condition</th>
        <th>Price</th>
        <th>Description</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {pendingListings.map((listing) => (
        <tr key={listing.id}>
          <td>{listing.listing_name}</td>
          <td>{listing.quantity}</td>
          <td>{listing.condition}</td>
          <td>{listing.price}</td>
          <td>{listing.description}</td>
          <td>
            <button
              onClick={() =>
                handleListingDecision(listing.id, "approve")
              }
            >
              Approve
            </button>

            <button
              onClick={() =>
                handleListingDecision(listing.id, "reject")
              }
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
