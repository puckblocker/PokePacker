import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { it, expect, vi, beforeEach, afterEach } from 'vitest'
import SearchResults from '../src/Buyer/SearchResults.jsx'  


const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})


const fakeResults = [
  { id: 5, listing_name: 'Charizard', price: 19.99, image: '/charizard.png' },
  { id: 9, listing_name: 'Blastoise', price: 14.99, image: '/blastoise.png' },
]


function renderSearch(url = '/search?q=charizard') {
  render(
    <MemoryRouter initialEntries={[url]}>
      <SearchResults />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// TEST 1: SHOWS THE SEARCH TERM AND THE RESULTS
it('shows the search term and the matching results', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => fakeResults,
  })

  renderSearch('/search?q=charizard')


  expect(screen.getByText(/results for: charizard/i)).toBeInTheDocument()


  expect(await screen.findByText('Charizard - $19.99')).toBeInTheDocument()
  expect(screen.getByText('Blastoise - $14.99')).toBeInTheDocument()


  expect(document.querySelector('img').getAttribute('src')).toContain('/media/charizard.png')


  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch.mock.calls[0][0]).toContain('/api/search?q=charizard')
})

// TEST 2: CLICKING A RESULT OPENS THAT ITEM
it('goes to the item page when a result is clicked', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => fakeResults,
  })

  renderSearch()


  await userEvent.click(await screen.findByRole('button', { name: /blastoise/i }))

  expect(mockNavigate).toHaveBeenCalledTimes(1)
  expect(mockNavigate).toHaveBeenCalledWith('/item/9')
})

// TEST 3: NO SEARCH TERM MEANS NO REQUEST
it('does not ask the server for anything when there is no search term', () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => fakeResults,
  })

  renderSearch('/search')

  expect(fetch).not.toHaveBeenCalled()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

// TEST 4: SERVER CANNOT BE REACHED
it('does not crash when the server cannot be reached', async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network down'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  renderSearch()


  await vi.waitFor(() => expect(errorSpy).toHaveBeenCalled())


  expect(screen.getByText(/results for: charizard/i)).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

// TEST 5: SERVER SENDS BACK AN ERROR (WILL THROW ERROR)
it('does not crash when the server sends back an error', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({ message: 'Server error' }),
  })

  renderSearch()

  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))


  expect(await screen.findByText(/results for: charizard/i)).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})