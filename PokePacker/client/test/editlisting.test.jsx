import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import EditListing from '../src/Seller/EditListing.jsx'  

beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {}) // FAKE ALERT
})

afterEach(() => {
    cleanup()
})

const fakeListing = {
    id: 42,
    listing_name: 'Charizard',
    description: 'First edition holo',
    quantity: 2,
    condition: 'mint',
    price: 19.99,
    image: 'charizard.png',
}

function renderEdit() {
    const onClose = vi.fn()
    const onSaved = vi.fn()
    render(<EditListing listing={fakeListing} onClose={onClose} onSaved={onSaved} />)
    return { onClose, onSaved }
}

// TEST 1 : FORM SHOWS UP WITH EXISTING LISTING VALUES AS WELL AS SUBMIT AN CANCEL BUTTONS
it('edit listing form and buttons appear on screen', () => {
    renderEdit()

    expect(screen.getByLabelText(/listing name/i)).toHaveValue('Charizard')
    expect(screen.getByLabelText(/description/i)).toHaveValue('First edition holo')
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(2)
    expect(screen.getByLabelText(/condition/i)).toHaveValue('mint')
    expect(screen.getByLabelText(/price/i)).toHaveValue(19.99)

    expect(screen.getByRole('button', { name : /save changes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name : /cancel/i })).toBeInTheDocument()

})

// TEST 2 : SET CHANGE DATA AND TOKEN
it('save listing changes', async () => {
    localStorage.setItem('packer_token', 'abc123')

    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
    })

    renderEdit()

    await userEvent.clear(screen.getByLabelText(/price/i))
    await userEvent.type(screen.getByLabelText(/price/i), '25')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))

    const firstCall = fetch.mock.calls[0]
    const url = firstCall[0]
    const options = firstCall[1]

    expect(url).toContain('/api/editListing')
    expect(options.method).toBe('PUT')
    expect(options.headers.Authorization).toBe('Bearer abc123')

    expect(options.body.get('listing_name')).toBe('Charizard')
    expect(options.body.get('description')).toBe('First edition holo')
    expect(options.body.get('quantity')).toBe('2')
    expect(options.body.get('condition')).toBe('mint')
    expect(options.body.get('price')).toBe('25')
    expect(options.body.get('image')).toBeNull()

})

// TEST 4 : SERVER REJECTS EDITS

it('reject listing changes', async () => {
    localStorage.setItem('packer_token', 'abc123')

    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({}),
    })
    
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { onSaved } = renderEdit()

    await userEvent.clear(screen.getByLabelText(/price/i))
    await userEvent.type(screen.getByLabelText(/price/i), '25')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText(/couldn't save your changes/i)).toBeInTheDocument()
    
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(onSaved).not.toHaveBeenCalled()

    expect(screen.getByLabelText(/price/i)).toHaveValue(25)

    errorSpy.mockRestore()
})

// TEST 5 : SERVER IS UNREACHABLE
it('shows an error message when the server cannot be reached', async () => {
    localStorage.setItem('packer_token', 'abc123')
    global.fetch = vi.fn().mockRejectedValue(new Error('Network down'))

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { onSaved } = renderEdit();

    await userEvent.clear(screen.getByLabelText(/price/i))
    await userEvent.type(screen.getByLabelText(/price/i), '25')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText(/couldn't save your changes/i)).toBeInTheDocument()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(onSaved).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/price/i)).toHaveValue(25)

    errorSpy.mockRestore()
})
