import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// HELPER FUNCTION FOR FORM INPUT
function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  ...rest
}) {
  return (
    <>
      <label>{label}: </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        {...rest}
      />
    </>
  );
}

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // CHECKOUT DATA
  const [formData, setFormData] = useState({
    name: "",
    num: "",
    expMonth: "",
    expYear: "",
    code: "",
    country: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    getCart();
  }, []);

  //LOADS BUYERS CART
  const getCart = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not load cart.");
        return;
      }

      setCartItems(data);
    } catch (error) {
      setError("Could not connect to the server.");
    }
  };

  //SENDS QUANTITY UPDATE TO BACKEND AND RETURNS RESULT
  const updateQuantity = async (listingId, quantity) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/cart/${listingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
          },
          body: JSON.stringify({ quantity: Number(quantity) }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not update quantity.");
        return;
      }

      await getCart();

      setMessage("Quantity updated!");
      setError("");
    } catch (error) {
      setError("Could not connect to the server.");
    }
  };

  //REMOVE ITEM FROM CART
  const removeItem = async (listingId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not remove item.");
        return;
      }

      setMessage("Item removed from cart!");
      setError("");
      //RELOADS CART
      window.location.reload();
    } catch (error) {
      setError("Could not connect to the server.");
    }
  };

  const checkout = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Checkout failed.");
        return;
      }

      setMessage(data.message);

      //FETCHES CART AGAIN (IT WILL BE EMPTY AFTER CHECKOUT)
      const cartResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("packer_token")}`,
        },
      });

      if (cartResponse.ok) {
        setCartItems(await cartResponse.json());
      }
    } catch {
      setError("Could not connect to the server.");
    }
  };

  //CALCULATES TOTAL PRICE
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.cart_quantity,
    0,
  );

  //UI
  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <Link to="/buyer/home">
        <button>Back to Homepage</button>
      </Link>
      <h1>My Cart</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {cartItems.length === 0 && !error ? (
        <p>Your cart is empty.</p>
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
                Item
              </th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                Price
              </th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                Quantity
              </th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                Subtotal
              </th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {cartItems.map((item) => (
              <tr key={item.listing_id}>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  <strong>{item.listing_name}</strong>
                  <p>{item.description}</p>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  ${Number(item.price).toFixed(2)}
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  <button
                    onClick={() =>
                      updateQuantity(item.listing_id, item.cart_quantity - 1)
                    }
                    disabled={item.cart_quantity <= 1}
                  >
                    -
                  </button>
                  <span style={{ margin: "0 12px" }}>{item.cart_quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.listing_id, item.cart_quantity + 1)
                    }
                    disabled={item.cart_quantity >= item.available_quantity}
                  >
                    +
                  </button>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  ${(Number(item.price) * item.cart_quantity).toFixed(2)}
                </td>

                <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                  <button
                    onClick={() => removeItem(item.listing_id)}
                    style={{
                      backgroundColor: "#c0392b",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 style={{ textAlign: "right", marginTop: "24px" }}>
        Cart Total: ${total.toFixed(2)}
      </h2>
      <button onClick={() => setShowCheckout(!showCheckout)}>
        {showCheckout ? "Close Checkout" : "Proceed To Checkout"}
      </button>
      {showCheckout && (
        <form onSubmit={checkout}>
          <h2>Card Information</h2>
          <FormInput
            label="*Name on Card"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="*Card Number"
            name="num"
            type="tel"
            maxLength="16"
            minLength="16"
            value={formData.num}
            onChange={handleChange}
            required
          />
          <FormInput
            label="*Expiration Month"
            name="expMonth"
            type="tel"
            maxLength="2"
            minLength="2"
            placeholder="MM"
            value={formData.expMonth}
            onChange={handleChange}
            required
          />
          <FormInput
            label="*Expiration Year"
            name="expYear"
            type="tel"
            maxLength="2"
            minLength="2"
            placeholder="YY"
            value={formData.expYear}
            onChange={handleChange}
            required
          />
          <FormInput
            label="*Security Code"
            name="code"
            type="tel"
            maxLength="3"
            minLength="3"
            value={formData.code}
            onChange={handleChange}
            required
          />
          <h2> Shipping Information </h2>
          <FormInput
            label="*Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Apartment"
            name="apartment"
            value={formData.apartment}
            onChange={handleChange}
            required
          />
          <FormInput
            label="*City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <FormInput
            label="*State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <FormInput
            label="*Zip Code / Postal Code"
            name="zipCode"
            type="tel"
            maxLength="5"
            minLength="5"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
          <button onClick={checkout} disabled={cartItems.length === 0}>
            Checkout
          </button>
        </form>
      )}
    </div>
  );
}
export default Cart;
