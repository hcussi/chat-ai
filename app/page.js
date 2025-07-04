'use client'

import { useState, useRef, useEffect } from 'react'
import showdown from 'showdown'

const converter = new showdown.Converter()

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
    const savedStats = localStorage.getItem('chatStats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
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
    } catch (error) {
      const modelTimestamp = new Date().toLocaleTimeString([], { minute: '2-digit', hour: '2-digit', second: '2-digit', hour12: false })
      const updatedHistory = [...newHistory, { role: 'model', parts: [{ text: error.message }], timestamp: modelTimestamp }]
      setHistory(updatedHistory)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center grid grid-cols-3 gap-4 p-4"
      style={{ backgroundImage: "url('/background.jpg')" }} // Replace with your image URL
    >
      <div className="col-span-1"></div>
      <div className="col-span-1 flex flex-col h-full">
        <div className="w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-lg sticky top-4 z-10">
          <h1 className="text-4xl font-bold mb-4 text-center text-black">Chat AI</h1>
          {stats && (
            <div className="w-full bg-gray-800 text-white p-2 rounded-lg shadow-lg text-xs font-mono">
              <div className="flex justify-between">
                <p>Model: {stats.model}</p>
                <p>Time: {stats.time}ms</p>
              </div>
              <div className="flex justify-between">
                <p>Input Tokens: {stats.inputTokens}</p>
                <p>Output Tokens: {stats.outputTokens}</p>
                <p>Total Tokens: {stats.totalTokens}</p>
              </div>
            </div>
          )}
          <div className="w-full mt-4">
            <textarea
              ref={textareaRef}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              rows="4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your prompt... (Shift+Enter for new line)"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full mt-4 p-4 bg-blue-500 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
              disabled={loading || !prompt.trim()}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
        <div className="w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-lg mt-4 flex-grow overflow-y-auto">
          <div className="flex-grow">
            {history.slice().reverse().map((item, index) => (
              <div key={index} className="mb-4">
                <div className={`p-4 rounded-lg ${item.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <p className="font-bold text-black font-orbitron">{item.role === 'user' ? 'You:' : 'AI:'}</p>
                    <p className="text-xs text-gray-500 font-mono">{item.timestamp}</p>
                  </div>
                  <div
                    className="text-black"
                    dangerouslySetInnerHTML={{ __html: converter.makeHtml(item.parts[0].text) }}
                  />
                </div>
              </div>
            ))}
            {loading && <p className="text-black">AI is thinking...</p>}
          </div>
        </div>
      </div>
      <div className="col-span-1"></div>
    </main>
  )
}
