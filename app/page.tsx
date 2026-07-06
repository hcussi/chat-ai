'use client'

import { useState, useEffect, KeyboardEventHandler } from 'react'
import { FiPlus } from 'react-icons/fi'
import Input from '../components/Input'
import History from '../components/History'
import ChatManager from '../components/ChatManager'
import { Content } from '@google/generative-ai'

interface HistoryItem extends Content {
  timestamp: string;
}

interface Stats {
  model: string;
  time: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface Chat {
  id: string;
  name: string;
  history: HistoryItem[];
  stats: Stats | null;
  createdAt: number;
}

export default function Home() {
  const [prompt, setPrompt] = useState<string>('')
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedChats = localStorage.getItem('chats')
    if (savedChats) {
      setChats(JSON.parse(savedChats))
    } else {
      const newChat: Chat = {
        id: Date.now().toString(),
        name: 'My Chat',
        history: [],
        stats: null,
        createdAt: Date.now(),
      }
      setChats([newChat])
      setActiveChatId(newChat.id)
    }
    const savedActiveChatId = localStorage.getItem('activeChatId')
    if (savedActiveChatId) {
      setActiveChatId(savedActiveChatId)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats))
    }
  }, [chats])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId)
    }
  }, [activeChatId])

  const activeChat = chats.find(chat => chat.id === activeChatId)

  const handleSubmit = async () => {
    if (!prompt.trim() || !activeChat) return

    const timestamp = new Date().toLocaleTimeString([], { minute: '2-digit', hour: '2-digit', second: '2-digit', hour12: false })
    const newHistory = [...activeChat.history, { role: 'user', parts: [{ text: prompt }], timestamp }]
    const updatedChats = chats.map(chat =>
      chat.id === activeChatId ? { ...chat, history: newHistory } : chat
    )
    setChats(updatedChats)
    setPrompt('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          history: newHistory.slice(0, -1).map(h => ({
            role: h.role,
            parts: h.parts.map(p => ({ text: p.text }))
          }))
        }),
      })
      const data = await res.json()
      const modelTimestamp = new Date().toLocaleTimeString([], { minute: '2-digit', hour: '2-digit', second: '2-digit', hour12: false })
      const updatedHistory = [...newHistory, { role: 'model', parts: [{ text: data.text }], timestamp: modelTimestamp }]
      const updatedChatsWithResponse = chats.map(chat =>
        chat.id === activeChatId ? { ...chat, history: updatedHistory, stats: {
          model: data.model,
          inputTokens: data.usage.inputTokens,
          outputTokens: data.usage.outputTokens,
          totalTokens: data.usage.totalTokens,
          time: data.time,
        } } : chat
      )
      setChats(updatedChatsWithResponse)
    } catch (error: any) {
      const modelTimestamp = new Date().toLocaleTimeString([], { minute: '2-digit', hour: '2-digit', second: '2-digit', hour12: false })
      const updatedHistory = [...newHistory, { role: 'model', parts: [{ text: error.message }], timestamp: modelTimestamp }]
      const updatedChatsWithError = chats.map(chat =>
        chat.id === activeChatId ? { ...chat, history: updatedHistory } : chat
      )
      setChats(updatedChatsWithError)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const createNewChat = () => {
    let newChatName = 'New Chat'
    let counter = 1
    while (chats.some(chat => chat.name === newChatName)) {
      newChatName = `New Chat ${counter}`
      counter++
    }

    const newChat: Chat = {
      id: Date.now().toString(),
      name: newChatName,
      history: [],
      stats: null,
      createdAt: Date.now(),
    }
    setChats([...chats, newChat])
    setActiveChatId(newChat.id)
  }

  const setChatName = (name: string) => {
    if (chats.some(chat => chat.name === name && chat.id !== activeChatId)) {
      alert('A chat with this name already exists.')
      return
    }
    const updatedChats = chats.map(chat =>
      chat.id === activeChatId ? { ...chat, name } : chat
    )
    setChats(updatedChats)
  }

  const clearChat = (id: string) => {
    if (chats.length === 1) {
      alert("You can't delete the last chat.")
      return
    }
    const updatedChats = chats.filter(chat => chat.id !== id)
    setChats(updatedChats)
    if (activeChatId === id) {
      setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
  }

  const sortedChats = [...chats].sort((a, b) => a.createdAt - b.createdAt)

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:w-72">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            AI
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Chat AI</h1>
        </div>

        <div className="px-3">
          <button
            onClick={createNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            <FiPlus className="h-4 w-4" /> New Chat
          </button>
        </div>

        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 pb-4">
          {sortedChats.map(chat => {
            const isActive = activeChatId === chat.id
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`group cursor-pointer rounded-lg px-3 py-2 transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <ChatManager
                  chatName={chat.name}
                  setChatName={(name) => setChatName(name)}
                  clearChat={() => clearChat(chat.id)}
                />
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main conversation area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <h2 className="truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {activeChat?.name}
          </h2>
          {activeChat?.stats && (
            <div className="flex flex-wrap items-center justify-end gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {activeChat.stats.model}
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {activeChat.stats.time} ms
              </span>
              <span
                className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                title={`Input ${activeChat.stats.inputTokens} / Output ${activeChat.stats.outputTokens}`}
              >
                {activeChat.stats.totalTokens} tokens
              </span>
            </div>
          )}
        </header>

        {activeChat && (
          <>
            <History history={activeChat.history} loading={loading} />
            <Input
              prompt={prompt}
              setPrompt={setPrompt}
              loading={loading}
              handleSubmit={handleSubmit}
              handleKeyDown={handleKeyDown}
            />
          </>
        )}
      </main>
    </div>
  )
}
