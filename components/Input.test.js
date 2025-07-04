import { render, screen, fireEvent } from '@testing-library/react'
import Input from './Input'

describe('Input', () => {
  it('renders the textarea and button', () => {
    render(<Input />)
    expect(screen.getByPlaceholderText(/enter your prompt/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('calls the setPrompt function when the user types in the textarea', () => {
    const setPrompt = jest.fn()
    render(<Input setPrompt={setPrompt} />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } })
    expect(setPrompt).toHaveBeenCalledWith('Hello, world!')
  })

  it('calls the handleSubmit function when the button is clicked', () => {
    const handleSubmit = jest.fn()
    render(<Input handleSubmit={handleSubmit} prompt="test" />)
    const button = screen.getByRole('button', { name: /send/i })
    fireEvent.click(button)
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('calls the handleKeyDown function when a key is pressed in the textarea', () => {
    const handleKeyDown = jest.fn()
    render(<Input handleKeyDown={handleKeyDown} />)
    const textarea = screen.getByPlaceholderText(/enter your prompt/i)
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })
    expect(handleKeyDown).toHaveBeenCalled()
  })
})
