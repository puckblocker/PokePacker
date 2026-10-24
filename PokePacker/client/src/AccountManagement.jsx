import { useState } from 'react';

const cellStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    textAlign: 'left'
};

function AccountManagement() {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [historyError, setHistoryError] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    //SENDS THE NEW USERNAME TO BACKEND AND UPDATES THE DATABASE
    const handleUsernameChange = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/account/username`,
                {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                },
                body: JSON.stringify({ username })
                }
            );
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Could not update username.');
                return;
            }
            setMessage(data.message);
            setUsername('');
        } catch {
            setError('Could not connect to the server.');
        }
    };

    //SENDS THE NEW PASSWROD TO BACKEND AND UPDATES THE DB AFTER VERIFICATION
    const handlePasswordChange = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/account/password`,
                {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
                }
            );

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Could not change password.');
                return;
            }

            setMessage(data.message);
            setCurrentPassword('');
            setNewPassword('');
        } catch {
            setError('Could not connect to the server.');
        }
    };

    //GETS THE 'ORDERS' FROM BACKEND (ITS JUST THE LISTINGS A USER CHECKSOUT WITH)
    const loadPurchaseHistory = async () => {
        setHistoryError('');
        setShowHistory(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/account/purchase-history`,
                {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                }}
            );

            const data = await response.json();
            if (!response.ok) {
                setHistoryError(data.message || 'Could not load purchase history.');
                return;
            }
            setPurchaseHistory(data);
        } catch {
            setHistoryError('Could not connect to the server.');
        }};

    //SENDS A REFUND REQUEST TO THE BAKCKEND
    const handleRefundRequest = async (orderItemId) => {
        setHistoryError('');
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/account/refund-request`,
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                },
                body: JSON.stringify({ orderItemId })
                } );

            const data = await response.json();
            if (!response.ok) {
                setHistoryError(data.message || 'Could not request refund.');
                return;
            }
            setMessage(data.message);
        } catch {
            setHistoryError('Could not connect to the server.');
        }};

    //UI 
    return (
        <div>
            <h1>Account Management</h1>
            <section>
            <h2>Change Username</h2>
            <form onSubmit={handleUsernameChange}>
                <input
                    type="text"
                    placeholder="Enter new username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    maxLength={15}
                    required
                />
                <button type="submit">Update Username</button>
            </form>
            {message && <p>{message}</p>}
            {error && <p>{error}</p>}
            </section>
            <section>
            <section>
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
                <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                />
                <button type="submit">Update Password</button>
            </form>
            </section>
            </section>
            <section>
            <h2>Purchase History</h2>
           <button type="button" onClick={loadPurchaseHistory}>
    View Purchase History
</button>

{historyError && <p>{historyError}</p>}

{showHistory && (
    <div>
        {purchaseHistory.length === 0 && !historyError ? (
            <p>No purchase history yet.</p>
        ) : (
            purchaseHistory.map((order) => (
                <div key={order.orderId} style={{ marginBottom: '30px' }}>
                    <h3>Order #{order.orderId}</h3>

                    <p>
                        <strong>Date:</strong>{' '}
                        {new Date(order.date).toLocaleString()}
                    </p>

                    <p>
                        <strong>Status:</strong> {order.status}
                    </p>

                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: '15px'
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={cellStyle}>Item</th>
                                <th style={cellStyle}>Quantity</th>
                                <th style={cellStyle}>Price</th>
                                <th style={cellStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={item.orderItemId ?? index}>
                                    <td style={cellStyle}>
                                        {item.listingName}
                                    </td>

                                    <td style={cellStyle}>
                                        {item.quantity}
                                    </td>
                                    <td style={cellStyle}>
                                        ${Number(item.price).toFixed(2)}
                                    </td>
                                    <td style={cellStyle}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRefundRequest(item.orderItemId)
                                            }
                                        >
                                            Request Refund
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p>
                        <strong>
                            Order Total: ${Number(order.total).toFixed(2)}
                        </strong>
                    </p>
                    <hr />
                </div>
            ))
        )}
    </div>
)}
</section>
</div>
);
}

export default AccountManagement;