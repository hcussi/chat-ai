export default function Loading() {
  return (
    <div className="flex items-start">
      <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
        <span className="flex gap-1">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400 [animation-delay:0.2s]" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400 [animation-delay:0.4s]" />
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">AI is thinking...</span>
      </div>
    </div>
  )
}
