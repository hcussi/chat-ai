import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('renders the title', () => {
    render(<Header stats={null} />)
    expect(screen.getByRole('heading', { name: /chat ai/i })).toBeInTheDocument()
  })

  it('renders the stats when provided', () => {
    const stats = {
      model: 'gemini-1.5-flash',
      time: 100,
      inputTokens: 1,
      outputTokens: 1,
      totalTokens: 2,
    }
    render(<Header stats={stats} />)
    expect(screen.getByText(/model: gemini-1.5-flash/i)).toBeInTheDocument()
    expect(screen.getByText(/time: 100ms/i)).toBeInTheDocument()
    expect(screen.getByText(/input tokens: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/output tokens: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/total tokens: 2/i)).toBeInTheDocument()
  })

  it('does not render the stats when not provided', () => {
    render(<Header stats={null} />)
    expect(screen.queryByText(/model:/i)).not.toBeInTheDocument()
  })
})
