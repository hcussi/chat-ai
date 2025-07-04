'use client'

import { useState, useEffect, KeyboardEventHandler } from 'react'
import Header from '../components/Header'
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

export default function Home() {
  const [prompt, setPrompt] = useState<string>('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [chatName, setChatName] = useState<string>('My Chat')

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
    const savedStats = localStorage.getItem('chatStats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
    const savedChatName = localStorage.getItem('chatName')
    if (savedChatName) {
      setChatName(savedChatName)
    }
  }, [])

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(history))
    }
  }, [history])

  useEffect(() => {
    if (stats) {
      localStorage.setItem('chatStats', JSON.stringify(stats))
    }
  }, [stats])

  useEffect(() => {
    localStorage.setItem('chatName', chatName)
  }, [chatName])

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    const timestamp = new Date().toLocaleTimeString([], { minute: '2-digit', hour: '2-digit', second: '2-digit', hour12: false })
    const newHistory = [...history, { role: 'user', parts: [{ text: prompt }], timestamp }]
    setHistory(newHistory)
    setPrompt('')
    setLoading(true)
    setStats(null)

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
      setHistory(updatedHistory)
      setStats({
        model: data.model,
        inputTokens: data.usage.inputTokens,
        outputTokens: data.usage.outputTokens,
        totalTokens: data.usage.totalTokens,
        time: data.time,
      })
    } catch (error: any) {
      const modelTimestamp = new Date().toLocaleTimeString([], { minute: '2-digit', hour: '2-digit', second: '2-digit', hour12: false })
      const updatedHistory = [...newHistory, { role: 'model', parts: [{ text: error.message }], timestamp: modelTimestamp }]
      setHistory(updatedHistory)
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

  const clearChat = () => {
    setHistory([])
    setStats(null)
    setChatName('My Chat')
    localStorage.removeItem('chatHistory')
    localStorage.removeItem('chatStats')
    localStorage.removeItem('chatName')
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center grid grid-cols-3 gap-4 p-4"
      style={{ backgroundImage: "url('/background.jpg')" }} // Replace with your image URL
    >
      {loading && <Loading />}
      <div className="col-span-1">
        <ChatManager chatName={chatName} setChatName={setChatName} clearChat={clearChat} />
      </div>
      <div className="col-span-1 flex flex-col h-full">
        <Header stats={stats} />
        <div className="w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-lg mt-4">
          <Input
            prompt={prompt}
            setPrompt={setPrompt}
            loading={loading}
            handleSubmit={handleSubmit}
            handleKeyDown={handleKeyDown}
          />
        </div>
        <History history={history} loading={loading} />
      </div>
      <div className="col-span-1"></div>
    </main>
  )
}
