interface Stats {
  model: string;
  time: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface HeaderProps {
  stats: Stats | null;
}

export default function Header({ stats }: HeaderProps) {
  return (
    <div className="w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-lg sticky top-4 z-10">
      <h1 className="text-4xl font-bold mb-4 text-center text-black">Chat AI</h1>
      {stats && (
        <div className="w-full bg-gray-800 text-white p-2 rounded-lg shadow-lg text-xs font-mono">
          <div className="flex justify-between">
            <p>Model: {stats.model}</p>
            <p>Time: {stats.time}ms</p>
          </div>
          <div className="flex justify-between">
            <p>Input Tokens: {stats.inputTokens}</p>
            <p>Output Tokens: {stats.outputTokens}</p>
            <p>Total Tokens: {stats.totalTokens}</p>
          </div>
        </div>
      )}
    </div>
  )
}
