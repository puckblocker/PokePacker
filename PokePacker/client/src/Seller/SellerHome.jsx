import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function SellerHome() {

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setListings(listings.filter((listing) => listing.id !== listingId));
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
          <h1> Welcome to PokéPacker! (Seller) </h1>
          <p>You have no listings yet.</p>
          <Link to="/seller/listing">
            <button>Create Listing</button>
          </Link>
        </div>
      );
    }

    return (
    <div>

      <h1> Welcome to PokéPacker! (Seller) </h1>
      <Link to="/seller/listing">
        <button>Create Listing</button>
      </Link>

      <table>
        <thead>
          <tr>
            <th>Listing Name</th>
            <th>Quantity</th>
            <th>Condition</th>
            <th>Price</th>
            <th>Image</th>
            <th>Description</th>
            <th>Status</th>
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
              <td>{listing.description}</td>
              <td>{listing.status}</td>
              <td>
                <button onClick={() => removeListing(listing.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default SellerHome;
