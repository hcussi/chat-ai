'use client'

import { useState } from 'react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Chat AI</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md"
          rows="4"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
        />
        <button
          type="submit"
          className="w-full mt-4 p-2 bg-blue-500 text-white rounded-md"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Send'}
        </button>
      </form>
      {response && (
        <div className="mt-8 p-4 border border-gray-300 rounded-md w-full max-w-xl">
          <h2 className="text-2xl font-bold mb-4">Response</h2>
          {response.error ? (
            <p className="text-red-500">{response.error}</p>
          ) : (
            <p>{response.text}</p>
          )}
        </div>
      )}
    </main>
  )
}