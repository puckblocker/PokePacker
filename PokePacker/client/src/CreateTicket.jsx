import {useState} from "react";
import {Link} from "react-router-dom";

function CreateTicket() {
    const [form, setForm] = useState({
        subject: "",
        description: ""
    });
    const [error, setError] = useState("");

    function handleChange(event) {
        const {name, value} = event.target;
        setForm((early) => ({...early,[name]: value}));
    }

    async function sendTicket(event) {
        event.preventDefault();
        setError("");


        try {
            const token = localStorage.getItem("packer_token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/createTicket`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        subject: form.subject,
                        description: form.description,
                    }),
                },
            );

            if(!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }

            setForm({
                subject: "",
                description: ""
            });
            alert("Ticket created successfully!");

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    }

    return (
        <div>
            <h1>Create Support Ticket</h1>
            <form onSubmit={sendTicket}>
                <section>
                    <strong>Subject:</strong> <br />
                    <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                    />
                </section>

                <section>
                    <strong>Description:</strong> <br />
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                    />
                </section>
                <button type="submit">Create Ticket</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
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
        </div>
    );
}

export default CreateTicket;