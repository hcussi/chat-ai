import './globals.css'
import { Orbitron } from 'next/font/google'
import { ReactNode } from 'react'

const orbitron = Orbitron({ subsets: ['latin'] })

export const metadata = {
  title: 'Chat AI',
  description: 'Chat with a Gemini-powered AI',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={orbitron.className}>{children}</body>
    </html>
  )
}
