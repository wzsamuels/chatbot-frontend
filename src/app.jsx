import { useState } from 'preact/hooks';

export function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Append user message
    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Fetch from your API
    const response = await fetch('https://api.zach-samuels.com/markov/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt: input }),
    });
    const data = await response.json();

    // Append bot response
    setMessages((prev) => [...prev, { text: data.text, sender: 'bot' }]);
  };

  return (
    <div class="max-w-2xl mx-auto flex flex-col h-screen p-4 bg-gray-50">
      <div class="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-lg shadow">
        {messages.map((msg) => (
          <div class={`p-3 rounded-lg max-w-[80%] ${
            msg.sender === 'user' 
              ? 'bg-blue-500 text-white self-end ml-auto' 
              : 'bg-gray-200 text-gray-800'
          }`}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={sendMessage} class="mt-4 flex gap-2">
        <input 
          value={input} 
          onInput={(e) => setInput(e.target.value)} 
          class="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button 
          type="submit" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}