import { KeyboardEventHandler, useEffect, useRef } from 'react'
import { FiSend } from 'react-icons/fi'

interface InputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  loading: boolean;
  handleSubmit: () => void;
  handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
}

export default function Input({ prompt, setPrompt, loading, handleSubmit, handleKeyDown }: InputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Grow the textarea with its content, up to a max height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [prompt])

  return (
    <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-zinc-300 bg-white p-2 shadow-sm transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900">
        <textarea
          ref={textareaRef}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt... (Shift+Enter for new line)"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <FiSend className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl px-2 text-center text-xs text-zinc-400 dark:text-zinc-600">
        Enter to send, Shift+Enter for a new line
      </p>
    </div>
  )
}
