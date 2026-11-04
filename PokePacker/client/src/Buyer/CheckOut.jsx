import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CheckOut() {
  // CHECKOUT STATES
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [code, setCardCode] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // CHECKOUT INFO BACKEND FRONTEND INTERACTION
  async function handleCheckoutForm(event) {
    event.preventDefault();

    // CARD  & ADDRESS INFO
    const checkoutData = {
      name: cardName,
      num: cardNumber,
      expMonth: cardMonth,
      expYear: cardYear,
      code: cardCode,
      country: country,
      address: address,
      apartment: apartment,
      city: city,
      state: state,
      zipCode: zipCode,
    };

    // SEND CHECKOUT INFO TO BACKEND
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        },
      );
      // GRAB TOKEN
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Checkout Failed.");
        return;
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  return (
    <div>
      <h1> Checkout! </h1>
      <form onSubmit={handleCheckoutForm}>
        <h2>Card Information</h2>
        <label>*Name On Card: </label>
        <input
          type="text"
          value={cardName}
          onChange={(event) => setCardName(event.target.value)}
          required
        />
        <label>*Card Number: </label>
        <input
          type="number"
          maxLength="16"
          minLength="16"
          value={cardNumber}
          onChange={(event) => setCardNumber(event.target.value)}
          required
        />
        <label>*Expiration Date: </label>
        <input
          type="number"
          maxLength="2"
          minLength="2"
          placeholder="MM"
          value={cardMonth}
          onChange={(event) => setCardMonth(event.target.value)}
          required
        />
        <input
          type="number"
          maxLength="2"
          minLength="2"
          placeholder="YY"
          value={cardYear}
          onChange={(event) => setCardYear(event.target.value)}
          required
        />
        <label>*Security Code: </label>
        <input
          type="number"
          placeholder="###"
          maxLength="3"
          minLength="3"
          value={code}
          onChange={(event) => setCardCode(event.target.value)}
          required
        />
        <h2>Shipping Address Information</h2>
        <label>*Country: </label>
        <input
          type="text"
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          required
        />
        <label>*Address: </label>
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
        />
        <label>Apartment: </label>
        <input
          type="text"
          value={apartment}
          onChange={(event) => setApartment(event.target.value)}
        />
        <label>*City: </label>
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          required
        />
        <label>*State: </label>
        <input
          type="text"
          value={state}
          onChange={(event) => setState(event.target.value)}
          required
        />
        <label>*Zip Code / Postal Code: </label>
        <input
          type="number"
          placeholder="#####"
          maxLength="5"
          minLength="5"
          value={zipCode}
          onChange={(event) => setZipCode(event.target.value)}
          required
        />
        <button type="submit">Finalize Purchase</button>
      </form>
    </div>
  );
}

export default CheckOut;
