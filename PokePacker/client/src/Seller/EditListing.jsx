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

    function handleChange(event)
    {
        const {name, value} = event.target;
        setForm((early) => ({...early,[name]: value}));
    }

    // SENDING LISTING TO SERVER
    async function saveListing(event) {
        event.preventDefault();
        
        try {

            const token = localStorage.getItem("packer_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/editListing`,
                {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                     },
                    body: JSON.stringify({
                        ...form,
                        quantity: Number(form.quantity),
                        price: Number(form.price),
                        image: form.image || null,
                        listingId: listing.id,
                    }),
                },
            );

            if(!response.ok) {
                throw new Error(`Failed to save listing: ${response.status}`);
            }
            const updated = await response.json();
            onSaved(updated);
        }
        
        catch(error) {
            console.error("Error: ", error);
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
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </form>
                </div>
            </div>
    );
}

export default EditListing;
