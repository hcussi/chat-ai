import { render, screen } from '@testing-library/react'
import History from './History'
import { Content } from '@google/generative-ai'

interface HistoryItem extends Content {
  timestamp: string;
}

describe('History', () => {
  it('renders the history', () => {
    const history: HistoryItem[] = [
      { role: 'user', parts: [{ text: 'prompt' }], timestamp: '12:00:00' },
      { role: 'model', parts: [{ text: 'response' }], timestamp: '12:00:01' },
    ]
    render(<History history={history} loading={false} />)
    expect(screen.getByText('prompt')).toBeInTheDocument()
    expect(screen.getByText('response')).toBeInTheDocument()
  })

  it('renders the loading indicator when loading', () => {
    render(<History history={[]} loading={true} />)
    expect(screen.getByText(/ai is thinking/i)).toBeInTheDocument()
  })

  it('does not render the loading indicator when not loading', () => {
    render(<History history={[]} loading={false} />)
    expect(screen.queryByText(/ai is thinking/i)).not.toBeInTheDocument()
  })
})
