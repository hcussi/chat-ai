import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../page'

global.fetch = jest.fn() as jest.Mock

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Home', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
    localStorage.clear()
    jest.spyOn(localStorage, 'setItem')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the heading and form', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /chat ai/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your prompt/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('updates the prompt when the user types in the textarea', () => {
    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i) as HTMLTextAreaElement
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

  it.skip('shows a loading indicator when the form is submitted', async () => {
    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(textarea, { target: { value: 'test prompt' } })
    fireEvent.click(button)

    expect(await screen.findByText('AI is thinking...')).toBeInTheDocument()
  })

  it('shows the response after the form is submitted', async () => {
    const mockResponse = { 
      text: 'This is a test response.',
      usage: {
        inputTokens: 1,
        outputTokens: 1,
        totalTokens: 2,
      },
      time: 100,
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
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
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API is down'))

    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(textarea, { target: { value: 'test prompt' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('API is down')).toBeInTheDocument()
    })
  })

  it('renders markdown in the response', async () => {
    const mockResponse = { 
      text: '**bold text**',
      usage: {
        inputTokens: 1,
        outputTokens: 1,
        totalTokens: 2,
      },
      time: 100,
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(textarea, { target: { value: 'test prompt' } })
    fireEvent.click(button)

    await waitFor(() => {
      const boldElement = screen.getByText('bold text')
      expect(boldElement).toBeInTheDocument()
      expect(boldElement.tagName).toBe('STRONG')
    })
  })

  it('saves chat history to localStorage', async () => {
    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00')

    const mockResponse = { 
      text: 'response',
      usage: {
        inputTokens: 1,
        outputTokens: 1,
        totalTokens: 2,
      },
      time: 100,
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Home />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    const button = screen.getByRole('button', { name: /send/i })

    fireEvent.change(textarea, { target: { value: 'prompt' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'chats',
        expect.stringContaining('prompt')
      )
    })
  })

  it('loads chat history from localStorage', () => {
    localStorage.setItem(
      'chats',
      JSON.stringify([
        {
          id: '1',
          name: 'My Chat',
          history: [
            { role: 'user', parts: [{ text: 'previous prompt' }], timestamp: '12:00:00' },
            { role: 'model', parts: [{ text: 'previous response' }], timestamp: '12:00:01' },
          ],
          stats: null,
          createdAt: Date.now(),
        },
      ])
    )
    localStorage.setItem('activeChatId', '1')

    render(<Home />)

    expect(screen.getByText('previous prompt')).toBeInTheDocument()
    expect(screen.getByText('previous response')).toBeInTheDocument()
  })
})
