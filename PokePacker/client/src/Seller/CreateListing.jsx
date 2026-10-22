import { useState } from "react";
import { Link } from "react-router-dom";

function CreateListing() {

    // VARIABLES
    const [form, setForm] = useState({
        listing_name: "",
        quantity: "",
        condition: "",
        price: "",
        //seller_id: "",
        image: "",
        description: ""
    });

    function handleChange(event)
    {
        const {name, value} = event.target;
        setForm((early) => ({...early,[name]: value}));
    }

    // SENDING LISTING TO SERVER
    async function sendListing(event) {
        event.preventDefault();
        
        const listingData = {
            ...form,
            quantity: Number(form.quantity),
            price: Number(form.price),
            image: form.image || null,
        }

        try {

            const token = localStorage.getItem("packer_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/createListing`,
                {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                     },
                    body: JSON.stringify(listingData),
                },
            );

            if(!response.ok) {
                throw new Error("${response.status}");
            }

            setForm({
                listing_name: "",
                quantity: "",
                condition: "",
                price: "",
                seller_id: "",
                image: "",
                description: ""
            });
        }
        catch(error) {
            console.error("Error: ", error);
        }
        
       
    }


    return (
        <div>
            <h1> Create a Listing! </h1>
            {/* CREATE LISTING INFO */}
            <form onSubmit={sendListing}>
                <label>Listing Name: </label>
                <input
                    id = "listing_name"
                    name = "listing_name"
                    type="text"
                    value={form.listing_name}
                    onChange={handleChange}
                    required
                />
                <label>Description: </label>
                <textarea
                    id = "description"
                    name = "description"
                    value={form.description}
                    onChange={handleChange}
                />
                <label>Quantity: </label>
                <input
                    id = "quantity"
                    name = "quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                />
                <label>Condition: </label>
                {/*
                <input
                    id = "condition"
                    name = "condition"
                    type="text"
                    value={form.condition}
                    onChange={handleChange}
                    required
                />
                */}
                <select
                        id = "condition"
                        name = "condition"
                        type="text"
                        value={form.condition}
                        onChange={handleChange}
                        required
                        >
                            <option value="" disabled>Select Condition</option>
                            <option value="new">New</option>
                            <option value="moderate">Moderate</option>
                            <option value="damaged">Damaged</option>

                </select>

                <label>Price: </label>
                <input
                    id = "price"
                    name = "price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Create Listing</button>

                <Link to="/seller/home">
                    <button>Back to Home</button>
                </Link>
            </form>
        </div>
    );
}

export default CreateListing;