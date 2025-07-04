import { render, screen, fireEvent } from '@testing-library/react'
import ChatManager from './ChatManager'

describe('ChatManager', () => {
  it('renders the chat name', () => {
    render(<ChatManager chatName="My Chat" setChatName={() => {}} clearChat={() => {}} />)
    expect(screen.getByText('My Chat')).toBeInTheDocument()
  })

  it('allows renaming the chat', () => {
    const setChatName = jest.fn()
    render(<ChatManager chatName="My Chat" setChatName={setChatName} clearChat={() => {}} />)
    const editButton = screen.getByLabelText(/edit chat name/i)
    fireEvent.click(editButton)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'New Chat Name' } })
    fireEvent.submit(input)
    expect(setChatName).toHaveBeenCalledWith('New Chat Name')
  })

  it('does not allow empty chat name', () => {
    const setChatName = jest.fn()
    render(<ChatManager chatName="My Chat" setChatName={setChatName} clearChat={() => {}} />)
    const editButton = screen.getByLabelText(/edit chat name/i)
    fireEvent.click(editButton)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: ' ' } })
    fireEvent.submit(input)
    expect(setChatName).not.toHaveBeenCalled()
  })

  it('does not allow chat name longer than 50 characters', () => {
    const setChatName = jest.fn()
    render(<ChatManager chatName="My Chat" setChatName={setChatName} clearChat={() => {}} />)
    const editButton = screen.getByLabelText(/edit chat name/i)
    fireEvent.click(editButton)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a'.repeat(51) } })
    fireEvent.submit(input)
    expect(setChatName).not.toHaveBeenCalled()
  })

  it('calls the clearChat function when the delete button is clicked', () => {
    const clearChat = jest.fn()
    render(<ChatManager chatName="My Chat" setChatName={() => {}} clearChat={clearChat} />)
    const deleteButton = screen.getByLabelText(/delete chat/i)
    fireEvent.click(deleteButton)
    expect(clearChat).toHaveBeenCalled()
  })
})
