import { useEffect, useState } from 'react';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        getCart();
    }, []);

    //LOADS BUYERS CART 
const getCart = async () => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/cart`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || 'Could not load cart.');
            return;
        }

        setCartItems(data);
    } catch (error) {
        setError('Could not connect to the server.');
    }
};

    //SENDS QUANTITY UPDATE TO BACKEND AND RETURNS RESULT
const updateQuantity = async (listingId, quantity) => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/cart/${listingId}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                },
                body: JSON.stringify({ quantity: Number(quantity) })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || 'Could not update quantity.');
            return;
        }

        await getCart();

        setMessage('Quantity updated!');
        setError('');
    } catch (error) {
        setError('Could not connect to the server.');
    }
};

    //REMOVE ITEM FROM CART
    const removeItem = async (listingId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/cart/${listingId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Could not remove item.');
                return;
            }

            setMessage('Item removed from cart!');
            setError('');
            //RELOADS CART
            window.location.reload();
        } catch (error) {
            setError('Could not connect to the server.');
        }
    };

    const checkout = async () => {
    setError('');
    setMessage('');

    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/checkout`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || 'Checkout failed.');
            return;
        }

        setMessage(data.message);

        //FETCHES CART AGAIN (IT WILL BE EMPTY AFTER CHECKOUT)
        const cartResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/cart`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('packer_token')}`
                }
            }
        );

        if (cartResponse.ok) {
            setCartItems(await cartResponse.json());
        }
    } catch {
        setError('Could not connect to the server.');
    }
};

    //CALCULATES TOTAL PRICE
    const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.cart_quantity,
    0
    );

    //UI
    return (
        <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            <h1>My Cart</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {cartItems.length === 0 && !error ? (
                <p>Your cart is empty.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Item</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Price</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Quantity</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Subtotal</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {cartItems.map((item) => (
                            <tr key={item.listing_id}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                    <strong>{item.listing_name}</strong>
                                    <p>{item.description}</p>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                    ${Number(item.price).toFixed(2)}
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                    <button
                                        onClick={() => updateQuantity(item.listing_id, item.cart_quantity - 1)}
                                        disabled={item.cart_quantity <= 1}
                                    >-
                                    </button>
                                    <span style={{ margin: '0 12px' }}>
                                        {item.cart_quantity}
                                    </span>

                                    <button
                                        onClick={() => updateQuantity(item.listing_id, item.cart_quantity + 1)}
                                        disabled={item.cart_quantity >= item.available_quantity}
                                    >+
                                    </button>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                    ${(Number(item.price) * item.cart_quantity).toFixed(2)}
                                </td>

                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                    <button
                                        onClick={() => removeItem(item.listing_id)}
                                        style={{
                                            backgroundColor: '#c0392b',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
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
            <h2 style={{ textAlign: 'right', marginTop: '24px' }}>
                Cart Total: ${total.toFixed(2)}
            </h2>
            <button onClick={checkout} disabled={cartItems.length === 0}>
                Checkout
            </button>
        </div>
    );
}
export default Cart;