import {useState} from 'react';

function CreateReview({listingId, onClose, onSaved}) {
    // VARIABLES
    const [form, setForm] = useState({
        description: "",
        rating: 1
    });

    const [error, setError] = useState("");

    function handleChange(event) {
        const {name, value} = event.target;
        setForm((early) => ({...early,[name]: value}));
    }

    // SENDING REVIEW TO SERVER
    async function saveReview(event) {
        event.preventDefault();
        setError("");

        try {
            const token = localStorage.getItem("packer_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/createReview`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        listing_id: listingId,
                        description: form.description,
                        rating: form.rating,
                    }),
                },
            );

            if(!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }

            setForm({
                description: "",
                rating: 1
            });
            onSaved();

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    }

    return (
        <div

            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
                
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "1rem",
                    minWidth: "300px",
                    borderRadius: "8px",
                }}
                onClick={(event) => event.stopPropagation()}
                >
                    <h1> Create Review </h1>
                    {/* REVIEW FORM */}
                    <form onSubmit={saveReview}>
                        <div>
                            <label> Rating: </label>
                            <input
                                id="rating"
                                name="rating"
                                type="number"
                                value={form.rating}
                                onChange={handleChange}
                                min="1"
                                max="5"
                                required
                            />
                        </div>
                        <div>
                            <label> Description: </label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                maxLength="300"
                                required
                            />
                        </div>
                        {error && <p>{error}</p>}
                        
                        <button type="submit">Submit Review</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </form>
                </div>
        </div>
    );
}

export default CreateReview;

