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
        description: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");

    function handleChange(event)
    {
        const {name, value} = event.target;
        setForm((early) => ({...early,[name]: value}));
    }

    // SENDING LISTING TO SERVER
    async function sendListing(event) {
        event.preventDefault();
        setError("");

        const formData = new FormData();
        formData.append("listing_name", form.listing_name);
        formData.append("description", form.description);
        formData.append("quantity", form.quantity);
        formData.append("condition", form.condition);
        formData.append("price", form.price);
        if (imageFile) formData.append("image", imageFile); // must match upload.single("image") in config/upload.js



        try {

            const token = localStorage.getItem("packer_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/createListing`,
                {
                    method: "POST",
                    headers: { 
                        Authorization: `Bearer ${token}`,
                     },
                    body: formData,
                },
            );

            if(!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }

            setForm({
                listing_name: "",
                quantity: "",
                condition: "",
                price: "",
                description: ""
            });
            
            setImageFile(null);
            event.target.reset();

            alert("Listing created successfully");
        
        }

        catch(err) {
            console.error(err);
            setError(err.message);
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
                    min="1"
                    step="1"
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
                        <option value="" disabled>Select condition</option>
                        <option value="mint">Mint</option>
                        <option value="moderate">Moderate</option>
                        <option value="damaged">Damaged</option>

                </select>

                <label>Price: </label>
                <input
                    id = "price"
                    name = "price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                />

                <label> Listing Image: </label>
                <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => {
                        setImageFile(event.target.files?.[0] ?? null);
                    }}
                />
                {imageFile && (
                    <p>Selected image: {imageFile.name}</p>
                )}

                {error && (
                    <p role="alert" style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <button type="submit">Create Listing</button>

                <Link to="/seller/home">
                    <button type="button">Back to Home</button>
                </Link>
            </form>
        </div>
    );
}

export default CreateListing;