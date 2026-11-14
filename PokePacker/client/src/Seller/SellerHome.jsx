import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import EditListing from "./EditListing";
import LogoutButton from "../LogoutButton.jsx";

function SellerHome() {

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  // MADISON CODE: Adding a notif for refund request  
  const [refundRequests, setRefundRequests] = useState([]);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

// GETTING LISTINGS FROM SERVER
useEffect(() => {
  async function loadListings() {

    const token = localStorage.getItem("packer_token");

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/showListings`,
        {headers: { Authorization: `Bearer ${token}` }}
        
      );

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  loadListings();
}, []);

//MADISON CODE: LOADS REFUND REQUEST IF SELLER HAS ANY
useEffect(() => {
    async function loadRefundRequests() {
        const token = localStorage.getItem("packer_token");
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/seller/refund-requests`,
                {
                headers: {
                Authorization: `Bearer ${token}`
                  }
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch refund requests");
            }

            const data = await response.json();
            setRefundRequests(data);
        } catch (error) {
            console.log(error);
        }
    }

    loadRefundRequests();
}, []);

  async function removeListing(listingId) {
    
    const token = localStorage.getItem("packer_token");

    if (!window.confirm("Are you sure you want to remove this listing?")) {
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/deleteListing`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ listingId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove listing");
      }

      // Remove the listing from the state
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
    }
    catch (error) {
      console.log(error);
    }
  }

    // RENDERING PAGE
    if (loading) {
      return <div>Loading...</div>;
    }
    if (listings.length === 0) {
      return (
        <div>
           <LogoutButton />
          <h1> Welcome to PokéPacker! (Seller) </h1>
          <p>You have no listings yet.</p>
          {/*MADISON CODE: SHOWS IF THE SELLER HAS REFUND REQUEST*/}
            <section>
                <h2>Refund Requests</h2>

                {refundRequests.length === 0 ? (
                    <p>No refund requests.</p>
                ) : (
                    refundRequests.map((request) => (
                        <p key={request.id}>
                            {request.buyer_username} has requested a refund for{" "}
                            {request.listing_name}.
                        </p>
                    ))
                )}
            </section>
            <Link to="/seller/account">
              <button>Account Management</button>
            </Link>

          <Link to="/seller/listing">
            <button>Create Listing</button>
          </Link>
        </div>
      );
    }

    return (
    <div>
      <LogoutButton />
      <h1> Welcome to PokéPacker! (Seller) </h1>
          {/*MADISON CODE: SHOWS IF THE SELLER HAS REFUND REQUEST*/}
            <section>
                <h2>Refund Requests</h2>

                {refundRequests.length === 0 ? (
                    <p>No refund requests.</p>
                ) : (
                    refundRequests.map((request) => (
                        <p key={request.id}>
                            {request.buyer_username} has requested a refund for{" "}
                            {request.listing_name}.
                        </p>
                    ))
                )}
            </section>
  
      <Link to="/seller/listing">
            <Link to="/seller/account">
              <button>Account Management</button>
            </Link>     

        <button>Create Listing</button>
      </Link>

      <table>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Listing Name
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Quantity
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Condition
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Price
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Image
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Description
            </th>
            <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
              Status
            </th>

          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id}>
              <td>{listing.listing_name}</td>
              <td>{listing.quantity}</td>
              <td>{listing.condition}</td>
              <td>{listing.price}</td>
              <td><img src={listing.image} alt={listing.listing_name} width="100" />
              </td>
              <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{listing.description}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{listing.status}</td>
              <th></th>
              <td>
                <button onClick={() => setEditing(listing)}>Edit</button>
                
                {listing.status === 'active' && (
                  <button onClick={() => navigate(`/item/${listing.id}`)}>
                    View Item
                  </button>
                )}

                <button onClick={() => removeListing(listing.id)}>Remove</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing !== null && (
        <EditListing
          listing = {editing}
          onClose = {() => setEditing(null)}
          onSaved = {(updated) => {
            setListings((prev) => prev.map((listing) => (listing.id === updated.id ? updated : listing)));
            setEditing(null);
          }}
          />


      )}

    </div>
  );
}

export default SellerHome;
