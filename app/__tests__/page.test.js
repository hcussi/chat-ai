import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../page'

global.fetch = jest.fn()

describe('Home', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('renders the heading and form', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /chat ai/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your prompt/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('updates the prompt when the user types in the textarea', () => {
    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } })
    expect(textarea.value).toBe('Hello, world!')
  })

  it('disables the send button when the prompt is empty', () => {
    render(<Home />)
    const button = screen.getByRole('button', { name: /send/i })
    expect(button).toBeDisabled()
  })

  it('enables the send button when the prompt is not empty', () => {
    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const button = screen.getByRole('button', { name: /send/i })
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    expect(button).not.toBeDisabled()
  })

  it('shows a loading indicator when the form is submitted', async () => {
    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(textarea, { target: { value: 'test prompt' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  it('shows the response after the form is submitted', async () => {
    const mockResponse = { text: 'This is a test response.' }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(textarea, { target: { value: 'test prompt' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('This is a test response.')).toBeInTheDocument()
    })
  })

  it('shows an error message if the fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API is down'))

    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(textarea, { target: { value: 'test prompt' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('API is down')).toBeInTheDocument()
    })
  })
})
