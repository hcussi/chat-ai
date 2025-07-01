'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  const handleSubmit = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({ error: error.message })
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
      className="flex min-h-screen flex-col items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/background.jpg')" }} // Replace with your image URL
    >
      <div className="w-full max-w-2xl mx-auto bg-white bg-opacity-80 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Chat AI</h1>
        <div className="w-full">
          <textarea
            ref={textareaRef}
            className="w-full p-4 border border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt... (Shift+Enter for new line)"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full mt-4 p-3 bg-blue-500 text-white rounded-lg font-semibold shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
            disabled={loading || !prompt.trim()}
          >
            {loading ? 'Loading...' : 'Send'}
          </button>
        </div>
        {loading && (
          <div className="mt-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {response && (
          <div className="mt-8 p-6 bg-white border border-blue-200 rounded-lg shadow-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Response</h2>
            {response.error ? (
              <p className="text-red-500">{response.error}</p>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{response.text}</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
