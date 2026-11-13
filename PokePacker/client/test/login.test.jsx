import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import Login from '../src/Visitor/Login.jsx'


const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup() 
})

async function fillAndSubmit() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
  await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
  await userEvent.type(screen.getByLabelText(/password/i), 'rightpass')
  await userEvent.click(screen.getByRole('button', { name: /login/i }))
}

it('shows an error when login fails', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ message: 'Invalid username or password' }),
  })

  await fillAndSubmit()

  expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument()
  expect(mockNavigate).not.toHaveBeenCalled()
})

function mockSuccessfulLogin(type) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ token: 'abc123', type, id: 7, status: 'active' }),
  })
}


// TEST 1 : SUCCESSFUL LOGIN FOR BUYER ACCOUNT
it('saves the token and sends a buyer to /buyer/home', async () => {
  mockSuccessfulLogin('buyer')

  await fillAndSubmit()

  await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/buyer/home'))
  expect(localStorage.getItem('packer_token')).toBe('abc123')
  expect(localStorage.getItem('packer_type')).toBe('buyer')
})

// TEST 2 : SUCCESSFUL LOGIN FOR SELLER ACCOUNT
it('saves the token and sends a seller to /seller/home', async () => {
  mockSuccessfulLogin('seller')

  await fillAndSubmit()

  await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/seller/home'))
  expect(localStorage.getItem('packer_token')).toBe('abc123')
  expect(localStorage.getItem('packer_type')).toBe('seller')
})

// TEST 3 : SUCCESSFUL LOGIN FOR ADMIN ACCOUNT
it('saves the token and sends an admin to /admin/home', async () => {
  mockSuccessfulLogin('admin')

  await fillAndSubmit()

  await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/home'))
  expect(localStorage.getItem('packer_token')).toBe('abc123')
  expect(localStorage.getItem('packer_type')).toBe('admin')
})

// TEST 4 : UNSUCCESSFUL LOGIN FOR ACCOUNT
it('shows "Login Failed." when the server gives no message', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({}),
  })

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

  await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
  await userEvent.type(screen.getByLabelText(/password/i), 'anypass')
  await userEvent.click(screen.getByRole('button', { name: /login/i }))

  expect(await screen.findByText(/login failed/i)).toBeInTheDocument()

  expect(localStorage.getItem('packer_token')).toBeNull()
  expect(mockNavigate).not.toHaveBeenCalled()
})

// TEST 5 : ENSURE USER INPUT IS BEING SENT
it('sends the typed username and password to the server', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ token: 'abc123', type: 'buyer', id: 7, status: 'active' }),
  })

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

  await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
  await userEvent.type(screen.getByLabelText(/password/i), 'secret123')
  await userEvent.click(screen.getByRole('button', { name: /login/i }))

  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))

  const firstCall = fetch.mock.calls[0]
  const url = firstCall[0]
  const options = firstCall[1]
  const sentData = JSON.parse(options.body)

  expect(url).toContain('/api/loginUser')
  expect(options.method).toBe('POST')
  expect(sentData).toEqual({ userName: 'testuser', password: 'secret123' })
})

// TEST 6 : ERROR MESSAGE IS PRESET WHEN SERVER CANNOT BE REACHED
it('shows an error message when the server cannot be reached', async () => {

  global.fetch = vi.fn().mockRejectedValue(new Error('Network down'))

  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

  await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
  await userEvent.type(screen.getByLabelText(/password/i), 'anypass')
  await userEvent.click(screen.getByRole('button', { name: /login/i }))

  expect(await screen.findByText(/could not reach the server/i)).toBeInTheDocument()

  expect(localStorage.getItem('packer_token')).toBeNull()
  expect(mockNavigate).not.toHaveBeenCalled()

  errorSpy.mockRestore()
})