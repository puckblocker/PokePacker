
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import LogoutButton from "../LogoutButton.jsx";

function BuyerHome() {
  const [searchParams, setSearchParams] = useState("");
  const [sellerMessage, setSellerMessage] = useState("");
  const [sellerStatus, setSellerStatus] = useState(null);
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [cartMessage, setCartMessage] = useState("");
  const [quantities, setQuantities] = useState({});

  // LOADS ALL ACTIVE MARKETPLACE LISTINGS
  async function getListings() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/marketplace`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      setListings(data);
    }
  }

    // ADDS SELECTED LISTING TO BUYER CART
  async function addToCart(listingId) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/cart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
        },
        body: JSON.stringify({
          listing_id: listingId,
          quantity: Number(quantities[listingId] || 1),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setCartMessage(data.message || "Could not add item to cart.");
      return;
    }

    setCartMessage(data.message);
  }

  // CHECK SELLER APPLICATION STATUS AND CURRENT LSITINGS WHEN PAGE LOADS
  useEffect(() => {
    async function getSellerStatus() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/seller-request`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
          },
        }
      );

      const data = await response.json();
      setSellerStatus(data);
    }

    getListings();
    getSellerStatus();
  }, []);

  // HANDLE SEARCH FORM
  function handleSearchForm(event) {
    event.preventDefault();
    navigate(`/results?q=${searchParams}`);
  }

  // SUBMIT SELLER APPLICATION
  async function handleSellerRequest() {
    const confirmed = window.confirm(
      "Are you sure you want to apply to become a seller? " +
      "Once approved, your account will permanently become a seller account. " +
      "You cannot switch it back to a buyer account."
    );

    if (!confirmed) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/seller-request`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
        },
      }
    );

    const data = await response.json();
    setSellerMessage(data.message);
  }

  return (
    <div>
      <LogoutButton />
      <h1>Welcome to PokéPacker! (Buyer)</h1>

      <form onSubmit={handleSearchForm}>
        <input
          type="search"
          value={searchParams}
          placeholder="Search..."
          onChange={(event) => setSearchParams(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <Link to="/buyer/cart">
        <button>See My Cart</button>
      </Link>

      <Link to="/buyer/account">
        <button>Account Management</button>
      </Link>

          <h2 style={{ marginTop: "24px" }}>Marketplace</h2>

          {cartMessage && (
            <p style={{ color: "green" }}>{cartMessage}</p>
          )}

          {listings.length === 0 ? (
            <p>No active listings currently available.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                    Listing
                  </th>
                  <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                    Price
                  </th>
                  <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                    Available
                  </th>
                  <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                    Quantity
                  </th>
                  <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  
                  </th>
                </tr>
              </thead>

              <tbody>
                {listings.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {item.image && (
                          <img
                            src={`${import.meta.env.VITE_API_URL}${item.image}`}
                            alt={item.listing_name}
                            width="90"
                            style={{ objectFit: "contain" }}
                          />
                        )}

                        <div>
                          <strong>{item.listing_name}</strong>
                          <p>{item.description}</p>
                          <p>Condition: {item.condition}</p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                      ${Number(item.price).toFixed(2)}
                    </td>

                    <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                      {item.quantity}
                    </td>

                    <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                      <button
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: Math.max(1, Number(prev[item.id] || 1) - 1),
                          }))
                        }
                        disabled={Number(quantities[item.id] || 1) <= 1}
                      >
                        -
                      </button>

                      <span style={{ margin: "0 12px" }}>
                        {quantities[item.id] || 1}
                      </span>

                      <button
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: Math.min(
                              Number(item.quantity),
                              Number(prev[item.id] || 1) + 1
                            ),
                          }))
                        }
                        disabled={Number(quantities[item.id] || 1) >= Number(item.quantity)}
                      >
                        +
                      </button>
                    </td>

                    <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                      <button
                        onClick={() => addToCart(item.id)}
                        disabled={Number(item.quantity) < 1}
                      >
                        Add to Cart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

      <h2>Become a Seller</h2>

      {sellerStatus?.status === "pending" && (
        <p>Your seller application is awaiting approval.</p>
      )}

      {sellerStatus?.status === "active" && (
        <p>
          Congratulations! Your seller application was approved.
          Please log out and log back in.
        </p>
      )}

      {sellerStatus?.status === "denied" && (
        <p>
          Your seller application was denied.
          You can continue using your buyer account.
        </p>
      )}
      {(!sellerStatus || sellerStatus.status === "denied" ) && (
        <>
            <button onClick={handleSellerRequest}>
              Apply to Become a Seller
            </button>
        </>
      )}

      {sellerMessage && <p>{sellerMessage}</p>}
    </div>
  );
}

export default BuyerHome;
