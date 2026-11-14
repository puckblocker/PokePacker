import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import CreateAccount from '../src/Visitor/CreateAccount.jsx'

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
  cleanup() // removes the rendered page so tests don't stack on each other
})



// TEST 1 : FORM SHOWS UP
it('form shows all three fields and submit button', () => {
    render(
    <MemoryRouter>
        <CreateAccount />
    </MemoryRouter>
    )
    expect(screen.getByText(/username/i)).toBeInTheDocument()
    expect(screen.getByText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name : /create account/i })).toBeInTheDocument()

})

// TEST 2 : TYPING FILLS IN THE FIELD
it('values are held in field', async () => {
    render(
        <MemoryRouter>
            <CreateAccount />
        </MemoryRouter>
    )
    
    const usernameInput = screen.getByLabelText(/username/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await userEvent.type(usernameInput, 'testuser')
    await userEvent.type(emailInput, 'test@email.com')
    await userEvent.type(passwordInput, 'rightpass')

    expect(usernameInput).toHaveValue('testuser')
    expect(emailInput).toHaveValue('test@email.com')
    expect(passwordInput).toHaveValue('rightpass')

})

// TEST 3 : SENDS THE RIGHT DATA
async function fillAndSubmit() {
  render(
    <MemoryRouter>
      <CreateAccount />
    </MemoryRouter>
  )
  await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
  await userEvent.type(screen.getByLabelText(/email/i), 'test@email.com')
  await userEvent.type(screen.getByLabelText(/password/i), 'rightpass')
  await userEvent.click(screen.getByRole('button', { name: /create account/i }))
}

it('form sends the correct data'), async () => {
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ }),
      })

    await fillAndSubmit()

    const firstCall = fetch.mock.calls[0]
    const url = firstCall[0]
    const options = firstCall[1]
    const sentData = JSON.parse(options.body)

    expect(url).toContain('/api/createUser')
    expect(options.method).toBe('POST')
    expect(sentData).toEqual({
    userName: 'testuser',
    email: 'test@example.com',
    password: 'secret123',
    })
}
// TEST 4 : SUBMITTING DOESNT CRASH

it('submitting doesnt crash when the server cannot be reached'), async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network down'))

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await fillAndSubmit

    expect(await screen.findByText(/could not reach the server/i).toBeInTheDocument)

    expect(mockNavigate).not.toHaveBeenCalled()

    errorSpy.mockRestore()
}

