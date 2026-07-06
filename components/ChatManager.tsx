import { useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

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

  if (isEditing) {
    return (
      <form onSubmit={handleNameSubmit} onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          onBlur={() => setIsEditing(false)}
          autoFocus
          maxLength={50}
          className="w-full rounded-md border border-indigo-400 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </form>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-sm">{chatName}</span>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setName(chatName)
            setIsEditing(true)
          }}
          aria-label="Edit chat name"
          className="rounded p-1 text-zinc-400 transition hover:bg-black/5 hover:text-zinc-600 dark:hover:bg-white/10 dark:hover:text-zinc-200"
        >
          <FiEdit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            clearChat()
          }}
          data-testid="delete-button"
          aria-label="Delete chat"
          className="rounded p-1 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-500"
        >
          <FiTrash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
