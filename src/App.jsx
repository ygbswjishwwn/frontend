import { useState } from 'react'

const BACKEND_URL = 'https://backend-2imb.onrender.com'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '出错了' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <div style={{ height: 400, overflowY: 'auto', border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <span style={{ background: m.role === 'user' ? '#dcf8c6' : '#f0f0f0', padding: '6px 12px', borderRadius: 12, display: 'inline-block' }}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div>思考中...</div>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, padding: 8 }}
          placeholder="输入消息..."
        />
        <button onClick={sendMessage}>发送</button>
      </div>
    </div>
  )
}

export default App