import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

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

  return (
    <div>
      <h1> Single Listings! (Buyer) </h1>
      <h2> Item Details</h2>
      {item ? (
        <div>
          <h3>{item.listing_name}</h3>
          <p>Price: {item.price}</p>
          <p>Condition: {item.condition}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Item Description: {item.description}</p>
          <p>{item.image}</p>
        </div>
      ) : (
        <p>Loading Item Details...</p>
      )}
    </div>
  );
}

export default ItemDetails;
