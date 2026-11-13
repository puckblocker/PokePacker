import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import CreateListing from '../src/Seller/CreateListing.jsx'  // check your real path

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {}) // fake alert
})

afterEach(() => {
  cleanup()
})

// TEST 1 : CREATE LISTING FORM SHOWS UP

it('create listing form and submit button appear on screen', () => {
    render(
    <MemoryRouter>
        <CreateListing />
    </MemoryRouter>
    )
    expect(screen.getByLabelText(/listing name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/condition/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/listing image/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name : /create listing/i })).toBeInTheDocument()

})

// TEST 2 : SUCCESSFUL FORM SUBMISSION

async function fillAndSubmit() {
    render(
        <MemoryRouter>
            <CreateListing />
        </MemoryRouter>
    )

    await userEvent.type(screen.getByLabelText(/listing name/i), 'test listing name')
    await userEvent.type(screen.getByLabelText(/description/i), 'test description')
    await userEvent.type(screen.getByLabelText(/quantity/i), '1')
    await userEvent.selectOptions(screen.getByLabelText(/condition/i), 'mint')
    await userEvent.type(screen.getByLabelText(/price/i), '1200')
    await userEvent.click(screen.getByRole('button', { name : /create listing/i }))
}


it('form sends the correct data', async () => {
    localStorage.setItem('packer_token', 'abc123')

    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
    })

    await fillAndSubmit()

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))

    const firstCall = fetch.mock.calls[0]
    const url = firstCall[0]
    const options = firstCall[1]

    expect(url).toContain('/api/createListing')
    expect(options.method).toBe('POST')
    expect(options.headers.Authorization).toBe('Bearer abc123')

    expect(options.body.get('listing_name')).toBe('test listing name')
    expect(options.body.get('description')).toBe('test description')
    expect(options.body.get('quantity')).toBe('1')
    expect(options.body.get('condition')).toBe('mint')
    expect(options.body.get('price')).toBe('1200')
    expect(options.body.get('image')).toBeNull()
    
})

// TEST 4 : Server Rejects it

it('server rejects listing', async () => {
    localStorage.setItem('packer_token', 'abc123')

    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Sellers Only'}),
    })
    
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await fillAndSubmit()

    expect(await screen.findByText(/sellers only/i)).toBeInTheDocument()

    expect(window.alert).not.toHaveBeenCalled()

    expect(screen.getByLabelText(/listing name/i)).toHaveValue('test listing name')
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(1)   // number input returns a number
    errorSpy.mockRestore()
})


// TEST 5 : SERVER GIVES NO MESSAGE

it('server gives no message', async () => {
    localStorage.setItem('packer_token', 'abc123')

    global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
    })
    
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await fillAndSubmit()

    expect(await screen.findByText(/request failed with status 500/i)).toBeInTheDocument()

    expect(window.alert).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/listing name/i)).toHaveValue('test listing name')

    errorSpy.mockRestore()
})

// TEST 6 : SERVER IS UNREACHABLE
it('shows an error message when the server cannot be reached', async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network down'))

  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  await fillAndSubmit();

  expect(await screen.findByText(/network down/i)).toBeInTheDocument()

  expect(window.alert).not.toHaveBeenCalled()
  expect(screen.getByLabelText(/listing name/i)).toHaveValue('test listing name')

  errorSpy.mockRestore()
})
// TEST 7 : IMAGE SELECTED

// TEST 8 : NO IMAGE SELECTED

// TEST 9 : REQUIRED FIELDS BLOCK SUBMISSION 