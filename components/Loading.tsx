export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
        <div className="w-4 h-4 rounded-full bg-white animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-4 h-4 rounded-full bg-white animate-pulse [animation-delay:0.4s]"></div>
        <span className="text-white text-lg">AI is thinking...</span>
      </div>
    </div>
  )
}
