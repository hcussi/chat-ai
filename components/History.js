import showdown from 'showdown'
import Loading from './Loading'

const converter = new showdown.Converter()

export default function History({ history, loading }) {
  return (
    <div className="w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-lg mt-4 flex-grow overflow-y-auto">
      <div className="flex-grow">
        {history.slice().reverse().map((item, index) => (
          <div key={index} className="mb-4">
            <div className={`p-4 rounded-lg ${item.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <div className="flex justify-between">
                <p className="font-bold text-black font-orbitron">{item.role === 'user' ? 'You:' : 'AI:'}</p>
                <p className="text-xs text-gray-500 font-mono">{item.timestamp}</p>
              </div>
              <div
                className="text-black"
                dangerouslySetInnerHTML={{ __html: converter.makeHtml(item.parts[0].text) }}
              />
            </div>
          </div>
        ))}
        {loading && <Loading />}
      </div>
    </div>
  )
}
