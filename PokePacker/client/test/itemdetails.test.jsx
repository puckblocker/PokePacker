import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import ItemDetails from '../src/Buyer/ItemDetails.jsx'

const fakeItem = {
  id: 5,
  listing_name: 'Charizard',
  price: 19.99,
  condition: 'mint',
  quantity: 5,
  description: 'First edition holo',
  image: '/charizard.png',
}


function renderItemDetails() {
  render(
    <MemoryRouter initialEntries={['/item/5']}>
      <Routes>
        <Route path="/item/:id" element={<ItemDetails />} />
      </Routes>
    </MemoryRouter>
  )
}

async function loadPage(cartResponse = { ok: true, status: 200, json: async () => ({}) }) {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => fakeItem })
    .mockResolvedValueOnce(cartResponse)

  renderItemDetails()
  await screen.findByText('Charizard')
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// TEST 1: LOADING TEXT, THEN THE ITEM
it('shows loading text, then the item details', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => fakeItem,
  })

  renderItemDetails()

 
  expect(screen.getByText(/loading item details/i)).toBeInTheDocument()

  
  expect(await screen.findByText('Charizard')).toBeInTheDocument()
  expect(screen.getByText('Price: $19.99')).toBeInTheDocument()
  expect(screen.getByText('Condition: mint')).toBeInTheDocument()
  expect(screen.getByText('Quantity: 5')).toBeInTheDocument()
  expect(screen.getByText('Item Description: First edition holo')).toBeInTheDocument()
  expect(screen.queryByText(/loading item details/i)).not.toBeInTheDocument()

  
  expect(fetch.mock.calls[0][0]).toContain('/api/item/5')
})

// TEST 5: ADDING TO THE CART WORKS
it('adds the item to the cart', async () => {
  localStorage.setItem('packer_token', 'abc123')
  await loadPage()

  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))

  expect(await screen.findByText(/item added to cart/i)).toBeInTheDocument()

  
  const cartCall = fetch.mock.calls[1]
  const url = cartCall[0]
  const options = cartCall[1]

  expect(url).toContain('/api/addToCart')
  expect(options.method).toBe('POST')
  expect(options.headers.Authorization).toBe('Bearer abc123')
  expect(JSON.parse(options.body)).toEqual({ itemID: 5, quantity: 1 })
})

// TEST 6: AMOUNT HIGHER THAN WHAT THE SELLER HAS
it('rejects an amount higher than the quantity in stock', async () => {
  localStorage.setItem('packer_token', 'abc123')  
  await loadPage()

  
  await userEvent.clear(screen.getByLabelText(/amount/i))
  await userEvent.type(screen.getByLabelText(/amount/i), '9')
  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))

  expect(await screen.findByText(/invalid item amount selected/i)).toBeInTheDocument()

  
  expect(fetch).toHaveBeenCalledTimes(1)
})

// TEST 7: NOT LOGGED IN
it('rejects adding to the cart when there is no login token', async () => {
  
  await loadPage()

  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))

  expect(await screen.findByText(/invalid account/i)).toBeInTheDocument()

  
  expect(fetch).toHaveBeenCalledTimes(1)
})

// TEST 9: SERVER REJECTS THE ADD (three versions of the failure message)
it('shows the server\'s "message" when adding to the cart fails', async () => {
  localStorage.setItem('packer_token', 'abc123')
  await loadPage({
    ok: false,
    status: 400,
    json: async () => ({ message: 'Out of stock' }),
  })

  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))

  expect(await screen.findByText(/failed: out of stock/i)).toBeInTheDocument()
  expect(screen.queryByText(/item added to cart/i)).not.toBeInTheDocument()
})

it('shows the server\'s "error" when there is no "message"', async () => {
  localStorage.setItem('packer_token', 'abc123')
  await loadPage({
    ok: false,
    status: 403,
    json: async () => ({ error: 'Sellers cannot buy' }),
  })

  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))

  expect(await screen.findByText(/failed: sellers cannot buy/i)).toBeInTheDocument()
})

it('shows "Unknown error" when the server gives no explanation', async () => {
  localStorage.setItem('packer_token', 'abc123')
  await loadPage({
    ok: false,
    status: 500,
    json: async () => ({}),
  })

  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))

  expect(await screen.findByText(/failed: unknown error/i)).toBeInTheDocument()
})