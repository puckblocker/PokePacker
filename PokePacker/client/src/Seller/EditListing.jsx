import { useState } from "react";

function EditListing({ listing, onClose, onSaved }) {

    // VARIABLES

    const [form, setForm] = useState({
        listing_name: listing.listing_name ?? "",
        quantity: listing.quantity ?? "",
        condition: listing.condition ?? "",
        price: listing.price ?? "",
        //seller_id: listing.seller_id ?? "",
        image: listing.image ?? "",
        description: listing.description ?? ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");

    function handleChange(event)
    {
        const {name, value} = event.target;
        setForm((early) => ({...early,[name]: value}));
    }

    // SENDING LISTING TO SERVER
    async function saveListing(event) {
        event.preventDefault();

        const body = new FormData();
        body.append("listingId", listing.id);
        body.append("listing_name", form.listing_name);
        body.append("description", form.description);
        body.append("quantity", Number(form.quantity));
        body.append("condition", form.condition);
        body.append("price", Number(form.price));
        if (imageFile) body.append("image", imageFile);
        
        try {

            const token = localStorage.getItem("packer_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/editListing`,
                {
                    method: "PUT",
                    headers: { 
                        Authorization: `Bearer ${token}`,
                     },
                     body: body,
                },
            );

            if(!response.ok) {
                throw new Error(`Failed to save listing: ${response.status}`);
            }
            const updated = await response.json();
            onSaved(updated);
        }
        
        catch(err) {
            console.error("Error: ", err);
            setError("Couldn't save your changes. Please try again.");
        }
    }
    return (
        <div
            onClick={onClose}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                >
                    <h1> Edit Listing2! </h1>
                    {/* CREATE LISTING INFO */}
                    <form onSubmit={saveListing}>
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
                                    <option value="mint">Mint</option>
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

                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </form>
                </div>
            </div>
    );
}

export default EditListing;