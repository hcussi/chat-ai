import { useState } from 'react'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'

interface ChatManagerProps {
  chatName: string;
  setChatName: (name: string) => void;
  clearChat: () => void;
}

export default function ChatManager({ chatName, setChatName, clearChat }: ChatManagerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(chatName)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (name.trim() && name.length <= 50) {
      setChatName(name)
      setIsEditing(false)
    }
  }

  return (
    <div className="w-full bg-white bg-opacity-80 p-4 rounded-lg shadow-lg">
      {isEditing ? (
        <form onSubmit={handleNameSubmit}>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            maxLength={50}
          />
        </form>
      ) : (
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{chatName}</h2>
          <div className="flex space-x-2">
            <button onClick={() => setIsEditing(true)} aria-label="Edit chat name">
              <FaPencilAlt className="h-5 w-5 text-gray-500" />
            </button>
            <button onClick={clearChat} data-testid="delete-button" aria-label="Delete chat">
              <FaTrash className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
