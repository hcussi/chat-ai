import { GoogleGenerativeAI, Content } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, history }: { prompt: string, history: Content[] } = await req.json()

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL as string })

  const chat = model.startChat({
    history: history,
  })

  try {
    const startTime = Date.now()
    const result = await chat.sendMessage(prompt)
    const endTime = Date.now()
    const response = await result.response
    const text = await response.text()
    const usageMetadata = response.usageMetadata
    return NextResponse.json({ 
      text,
      model: process.env.GEMINI_MODEL,
      usage: {
        inputTokens: usageMetadata?.promptTokenCount,
        outputTokens: usageMetadata?.candidatesTokenCount,
        totalTokens: usageMetadata?.totalTokenCount,
      },
      time: endTime - startTime,
     })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
