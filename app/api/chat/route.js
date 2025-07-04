import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req) {
  const { prompt, history } = await req.json()

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL })

  const chat = model.startChat({
    history: history,
  })

  try {
    const result = await chat.sendMessage(prompt)
    const response = await result.response
    const text = await response.text()
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
