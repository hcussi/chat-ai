export default function Input({ prompt = '', setPrompt, loading, handleSubmit, handleKeyDown }) {
  return (
    <div className="w-full mt-4">
      <textarea
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
  )
}
