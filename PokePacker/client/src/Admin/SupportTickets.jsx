import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function SupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTickets();
    }, []);

        async function loadTickets() {
            try {
                const response = await fetch(`
                    ${import.meta.env.VITE_API_URL}/api/showTickets`,
                    {headers: {Authorization: `Bearer ${localStorage.getItem("packer_token")}`}}
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch support tickets");
                }
                const data = await response.json();
                setTickets(data);
        } catch (err) {
            console.error("Error fetching support tickets:", err);
            setError("Failed to fetch support tickets");
        }
    }

    async function closeTickets(ticketId) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/closeTickets`,
                {
                    method: "PATCH",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("packer_token")}`
                    },
                    body: JSON.stringify({ticketId}),
                },
                
            );
            

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error("Failed to close support tickets");
            }
            await loadTickets();
        } catch (err) {
            console.error("Error closing support tickets:", err);
            setError("Failed to close support tickets");
        }
    }

    return (
        <div>
            <Link to="/admin/home">
                <button>Back to Admin Home</button>
            </Link>
            <br />
            <br />
            <h1>Support Tickets</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!error && tickets.length === 0 && <p>No support tickets available.</p>}
            {tickets.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Username</th>
                            <th>Subject</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>{ticket.id}</td>
                                <td>{ticket.username}</td>
                                <td>{ticket.subject}</td>
                                <td>{ticket.description}</td>
                                <td>{ticket.status}</td>
                                <td>{new Date(ticket.created_at).toLocaleString()}</td>
                                {ticket.status !== 'closed' &&
                                    <td>
                                        <button onClick={() => closeTickets(ticket.id)}>Close</button>
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

}

export default SupportTickets;

