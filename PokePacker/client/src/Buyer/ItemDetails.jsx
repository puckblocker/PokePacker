import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [itemAmount, setItemAmount] = useState(1);
  const [message, setMessage] = useState("");

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

  return (
    <div>
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
            style={{ maxWidth: "200px" }}
          />
        </div>
      ) : (
        <p>Loading Item Details...</p>
      )}
      <label htmlFor="amount">Amount: </label>
      <input
        id = "amount"
        type="number"
        value={itemAmount}
        onChange={(event) => {
          setItemAmount(event.target.value);
          setMessage("");
        }}
      ></input>
      {message}
      <button onClick={() => handleAddToCart(item.id)}>Add To Cart</button>
    </div>
  );
}

export default ItemDetails;
