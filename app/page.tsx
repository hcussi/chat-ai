'use client'

import { useState, useEffect, KeyboardEventHandler } from 'react'
import Input from '../components/Input'
import History from '../components/History'
import Loading from '../components/Loading'
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
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats))
    }
  }, [chats])

  useEffect(() => {
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

  return (
    <main
      className="min-h-screen bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/background.jpg')" }} // Replace with your image URL
    >
      <h1 className="text-4xl font-bold mb-4 text-center text-white">Chat AI</h1>
      <div className="grid grid-cols-3 gap-8">
        {loading && <Loading />}
        <div className="col-span-1 p-4 pr-5">
          <h2 className="text-lg font-bold mb-2 text-center text-white">Chats</h2>
          <button onClick={createNewChat} className="w-full p-2 bg-blue-500 text-white rounded-lg mb-4">
            New Chat
          </button>
          {chats.sort((a, b) => a.createdAt - b.createdAt).map(chat => (
            <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`p-2 rounded-lg cursor-pointer ${activeChatId === chat.id ? 'bg-blue-200' : ''}`}>
              <ChatManager chatName={chat.name} setChatName={(name) => setChatName(name)} clearChat={() => clearChat(chat.id)} />
            </div>
          ))}
        </div>
        <div className="col-span-1 flex flex-col h-full p-4 pr-5">
          {activeChat && (
            <>
              <div className="w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-2 text-center">Prompt</h2>
                <Input
                  prompt={prompt}
                  setPrompt={setPrompt}
                  loading={loading}
                  handleSubmit={handleSubmit}
                  handleKeyDown={handleKeyDown}
                />
              </div>
              <History history={activeChat.history} loading={loading} />
            </>
          )}
        </div>
        <div className="col-span-1 p-4 pr-5">
          {activeChat && activeChat.stats && (
            <div className="w-full bg-white bg-opacity-80 p-4 rounded-lg shadow-lg text-xs font-mono">
              <h2 className="text-lg font-bold mb-2 text-center">Status Information</h2>
              <div className="w-full bg-gray-800 text-white p-2 rounded-lg shadow-lg">
                <div className="flex justify-between">
                  <p>Model:</p>
                  <p>{activeChat.stats.model}</p>
                </div>
                <div className="flex justify-between">
                  <p>Time:</p>
                  <p>{activeChat.stats.time}ms</p>
                </div>
                <div className="flex justify-between">
                  <p>Input Tokens:</p>
                  <p>{activeChat.stats.inputTokens}</p>
                </div>
                <div className="flex justify-between">
                  <p>Output Tokens:</p>
                  <p>{activeChat.stats.outputTokens}</p>
                </div>
                <div className="flex justify-between">
                  <p>Total Tokens:</p>
                  <p>{activeChat.stats.totalTokens}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
