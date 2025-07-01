'use client'

import { useState, useRef, useEffect } from 'react'
import showdown from 'showdown'

const converter = new showdown.Converter()

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [history]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    const newHistory = [...history, { prompt, response: null }]
    setHistory(newHistory)
    setPrompt('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      const updatedHistory = newHistory.map((item, index) => 
        index === newHistory.length - 1 ? { ...item, response: data } : item
      )
      setHistory(updatedHistory)
    } catch (error) {
      const updatedHistory = newHistory.map((item, index) =>
        index === newHistory.length - 1 ? { ...item, response: { error: error.message } } : item
      )
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
        <div className="w-full max-w-2xl mx-auto bg-white bg-opacity-80 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-8 text-center text-black">Chat AI</h1>
          <div className="w-full">
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
        <div className="w-full max-w-2xl mx-auto bg-white bg-opacity-80 p-8 rounded-lg shadow-lg mt-4 flex-grow overflow-y-auto">
          <div className="flex-grow">
            {history.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="p-4 bg-blue-100 rounded-lg">
                  <p className="font-semibold text-black">You:</p>
                  <p className="text-black">{item.prompt}</p>
                </div>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                  <p className="font-semibold text-black">AI:</p>
                  {item.response ? (
                    item.response.error ? (
                      <p className="text-red-500">{item.response.error}</p>
                    ) : (
                      <div
                        className="text-black"
                        dangerouslySetInnerHTML={{ __html: converter.makeHtml(item.response.text) }}
                      />
                    )
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.4s]"></div>
                      <span className="text-black">AI is thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
      <div className="col-span-1"></div>
    </main>
  )
}
