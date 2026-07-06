import { useEffect, useRef } from 'react'
import showdown from 'showdown'
import { FiMessageSquare } from 'react-icons/fi'
import Loading from './Loading'
import { Content } from '@google/generative-ai'

const converter = new showdown.Converter({ simpleLineBreaks: true, tables: true })

interface HistoryItem extends Content {
  timestamp: string;
}

interface HistoryProps {
  history: HistoryItem[];
  loading: boolean;
}

export default function History({ history, loading }: HistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [history, loading])

  if (history.length === 0 && !loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <FiMessageSquare className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Start a conversation</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Ask anything. Powered by Gemini.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {history.map((item, index) => {
          const isUser = item.role === 'user'
          return (
            <div key={index} className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 px-1 text-xs text-zinc-400 dark:text-zinc-500">
                <span className="font-medium text-zinc-500 dark:text-zinc-400">{isUser ? 'You' : 'AI'}</span>
                <span>{item.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  isUser
                    ? 'rounded-br-sm bg-indigo-600 text-white'
                    : 'rounded-bl-sm bg-white text-zinc-800 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{item.parts[0].text}</p>
                ) : (
                  <div
                    className="md"
                    dangerouslySetInnerHTML={{ __html: converter.makeHtml(item.parts[0].text || '') }}
                  />
                )}
              </div>
            </div>
          )
        })}
        {loading && <Loading />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
