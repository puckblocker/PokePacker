import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import AdminHome from '../src/Admin/AdminHome.jsx'

const fakeUser = {
  id: 11,
  username: 'sylveon',
  email: 'sylveon@email.com',
  type: 'buyer',
  status: 'pending',
}

const fakeListing = {
  id: 12,
  listing_name: 'Charizard',
  quantity: 2,
  condition: 'mint',
  price: 19.99,
  description: 'First edition holo',
}

function reply(body, ok = true, status = 200) {
  return Promise.resolve({ ok, status, json: async () => body })
}

function fakeServer({ users = [], listings = [], actionMessage = 'Done' } = {}) {
  global.fetch = vi.fn((url) => {
    if (url.includes('/pending-users')) return reply(users)
    if (url.includes('/pending-listings')) return reply(listings)
    return reply({ message: actionMessage })
  })
}

function findCall(text) {
  return fetch.mock.calls.find((call) => call[0].includes(text))
}

function countCalls(text) {
  return fetch.mock.calls.filter((call) => call[0].includes(text)).length
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// TEST 1: SHOWS THE PENDING ACCOUNTS AND LISTINGS
it('shows the pending accounts and pending listings', async () => {
  fakeServer({ users: [fakeUser], listings: [fakeListing] })

  render(<AdminHome />)

  expect(await screen.findByText('sylveon')).toBeInTheDocument()
  expect(screen.getByText('sylveon@email.com')).toBeInTheDocument()
  expect(screen.getByText('buyer')).toBeInTheDocument()
  expect(screen.getByText('pending')).toBeInTheDocument()

  expect(await screen.findByText('Charizard')).toBeInTheDocument()
  expect(screen.getByText('mint')).toBeInTheDocument()
  expect(screen.getByText('19.99')).toBeInTheDocument()
  expect(screen.getByText('First edition holo')).toBeInTheDocument()

  expect(screen.queryByText(/no accounts are awaiting approval/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/no listings are awaiting approval/i)).not.toBeInTheDocument()

  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/admin/pending-users'))
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/admin/pending-listings'))
})

// TEST 2: APPROVING AN ACCOUNT
it('approves an account, shows the message, and reloads the list', async () => {
  fakeServer({ users: [fakeUser], actionMessage: 'User approved' })

  render(<AdminHome />)
  await screen.findByText('sylveon')

  await userEvent.click(screen.getByRole('button', { name: 'Approve' }))

  expect(await screen.findByText('User approved')).toBeInTheDocument()

  const call = findCall('/approve-user/11')
  expect(call).toBeDefined()
  expect(call[1].method).toBe('PATCH')

  await vi.waitFor(() => expect(countCalls('/pending-users')).toBe(2))
})

// TEST 3: REJECTING AN ACCOUNT NEEDS A REASON
it('asks for a reason before rejecting an account, then sends it', async () => {
  fakeServer({ users: [fakeUser], actionMessage: 'User rejected' })

  render(<AdminHome />)
  await screen.findByText('sylveon')

  await userEvent.click(screen.getByRole('button', { name: 'Reject' }))
  expect(screen.getByPlaceholderText('Enter reason')).toBeInTheDocument()
  expect(findCall('/reject-user/')).toBeUndefined()

  await userEvent.click(screen.getByRole('button', { name: 'Confirm Rejection' }))
  expect(await screen.findByText(/a reason is required/i)).toBeInTheDocument()
  expect(findCall('/reject-user/')).toBeUndefined()

  await userEvent.type(screen.getByPlaceholderText('Enter reason'), 'Fake email address')
  await userEvent.click(screen.getByRole('button', { name: 'Confirm Rejection' }))

  expect(await screen.findByText('User rejected')).toBeInTheDocument()

  const call = findCall('/reject-user/11')
  expect(call[1].method).toBe('PATCH')
  expect(call[1].headers['Content-Type']).toBe('application/json')
  expect(JSON.parse(call[1].body)).toEqual({ reason: 'Fake email address' })

  expect(screen.queryByPlaceholderText('Enter reason')).not.toBeInTheDocument()
})

// TEST 4: APPROVING AND REJECTING A LISTING
it('approves and rejects a pending listing', async () => {
  fakeServer({ listings: [fakeListing], actionMessage: 'Listing updated' })

  render(<AdminHome />)
  await screen.findByText('Charizard')

  await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
  expect(await screen.findByText('Listing updated')).toBeInTheDocument()

  const approveCall = findCall('/approve-listing/12')
  expect(approveCall).toBeDefined()
  expect(approveCall[1].method).toBe('PATCH')
  await vi.waitFor(() => expect(countCalls('/pending-listings')).toBe(2))

  await userEvent.click(screen.getByRole('button', { name: 'Reject' }))
  await vi.waitFor(() => expect(findCall('/reject-listing/12')).toBeDefined())
  expect(findCall('/reject-listing/12')[1].method).toBe('PATCH')
})

// TEST 5: THE LISTS CANNOT BE LOADED
it('shows an error for each list that cannot be loaded', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({}),
  })

  render(<AdminHome />)

  expect(await screen.findByText('Not loading pending accounts')).toBeInTheDocument()
  expect(await screen.findByText('Could not load pending listings')).toBeInTheDocument()

  expect(screen.queryByText(/no accounts are awaiting approval/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/no listings are awaiting approval/i)).not.toBeInTheDocument()
})