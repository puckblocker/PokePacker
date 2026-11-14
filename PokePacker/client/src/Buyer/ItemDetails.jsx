import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [itemAmount, setItemAmount] = useState(1);
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState([]);

  // CALL WHEN PAGE LOADS
  useEffect(() => {
    async function getItem() {
      // GRAB ITEM FROM BACKEND
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/item/${id}`,
        );
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Error: ", error);
      }
    }

    if (id) {
      getItem();
    }
  }, [id]);

  useEffect(() => {
    async function getReviews() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/showReviews/${id}`,
        );

        setReviews(await response.json());

      } catch (error) {
        console.error("Error: ", error);
      }
    }

    if (id) {
      getReviews();
    }
  }, [id]);

  // SEND TO CART
  async function handleAddToCart(itemID) {
    const token = localStorage.getItem("packer_token");

    // CHECK FOR VALID QUANTITY
    if (itemAmount < 0 || itemAmount > item.quantity) {
      setMessage("Invalid Item Amount Selected");
      return;
    }

    // CHECK FOR TOKEN
    if (!token) {
      setMessage("Invalid Account");
      return;
    }

    setMessage("");

    // PACKAGE DATA
    const cartData = {
      itemID: itemID,
      quantity: itemAmount,
    };

    // SEND CART INFO TO BACKEND
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/addToCart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cartData),
        },
      );
      const data = await response.json();

      if (response.ok) {
        setMessage("Item Added to Cart.");
      } else {
        setMessage(`Failed: ${data.message || data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }
    async function deleteReview(reviewId) {
      const token = localStorage.getItem("packer_token");

      if (!window.confirm("Are you sure you want to remove this review?")) {
      return;
    }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/deleteReview`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reviewId }),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to delete review");
        }
        // Remove the deleted review from the state
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== reviewId),
        );
      }
      catch (error) {
        console.error("Error: ", error);
      }
    }

  return (
    <div>

      {localStorage.getItem("packer_type") === 'buyer' && (
        <Link to="/buyer/home">
          <button>Back to Home</button>
        </Link>
      )}

      {localStorage.getItem("packer_type") === 'seller' && (
        <Link to="/seller/home">
          <button>Back to Home</button>
        </Link>
      )}

      <h1> Item Details</h1>
      {item ? (
        <div>
          <h2>{item.listing_name}</h2>
          <p>Price: ${item.price}</p>
          <p>Condition: {item.condition}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Item Description: {item.description}</p>
          <img
            src={`${import.meta.env.VITE_API_URL}/media${item.image}`}
            alt={item.listing_name} width="100"
            style={{ maxWidth: "200px" }}
          />
        </div>
      ) : (
        <p>Loading Item Details...</p>
      )}
      <label>Amount: </label>
      <input
        type="number"
        value={itemAmount}
        onChange={(event) => {
          setItemAmount(event.target.value);
          setMessage("");
        }}
      ></input>
      {message}
      <button onClick={() => handleAddToCart(item.id)}>Add To Cart</button>

      <h2>Reviews</h2>
      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <strong>Reviewer:</strong> <strong>{review.username}</strong> <br />
              <strong>Rating:</strong> {review.rating} <br />
              <strong>Description:</strong> {review.description} <br />
              {localStorage.getItem("packer_token") && (
                <button onClick={() => deleteReview(review.id)}>Delete</button>
              )}

            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
}

export default ItemDetails;
