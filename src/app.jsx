import { useState, useRef, useEffect } from 'preact/hooks';

const AVAILABLE_BOTS = [
  { id: 'markov', name: 'Markov' },
  { id: 'slm', name: 'LLM' },
];

export function App() {
  const [selectedBot, setSelectedBot] = useState(AVAILABLE_BOTS[0].id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');  
  const [temperature, setTemperature] = useState(1);
  const [maxTokens, setMaxTokens] = useState(50);  
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Append user message
    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const payload = {
      prompt: input,
      persona: 'modern',
      max_new_tokens: maxTokens,
    };
    // Fetch from your API
    console.log('Sending payload to API:', payload);

    setIsLoading(true);

    try {
      const response = await fetch(`https://api.zach-samuels.com/${selectedBot}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      console.log('API response:', response);
      const data = await response.json();

      // Append bot response
      setMessages((prev) => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      console.error("Error communicating with API:", error);
      setMessages((prev) => [...prev, { text: "Error connecting to bot.", sender: 'bot' }]);
    } finally {
      // 3. Always set loading to false when done, even if it errors
      setIsLoading(false);
    }
  };

  return (
    <div class="max-w-2xl mx-auto flex flex-col h-screen p-4 bg-gray-50">
      {/* Configuration Header */}
      <div class="bg-white p-4 rounded-lg shadow mb-4 border border-gray-100 flex flex-col gap-4">
        
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-bold text-gray-800">Chat Configuration</h1>
          <select 
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 cursor-pointer"
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            disabled={isLoading}
          >
            {AVAILABLE_BOTS.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer select-none"
          >
            {showAdvanced ? '− Hide advanced settings' : '+ Show advanced settings'}
          </button>
        </div>

        {showAdvanced && (
          <div class="flex gap-4 border-t border-gray-100 pt-3 mt-1">
            <div class="flex-1 flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 uppercase">Temperature ({temperature})</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={temperature}
                onInput={(e) => setTemperature(e.target.value)}
                disabled={isLoading}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>
            
            <div class="flex-1 flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 uppercase">Max Tokens</label>
              <input 
                type="number" 
                min="1"
                max="8000"
                value={maxTokens}
                onInput={(e) => setMaxTokens(e.target.value)}
                disabled={isLoading}
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 disabled:bg-gray-100"
              />
            </div>
          </div>
        )}
        
      </div>

      <div class="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-lg shadow border border-gray-100">
        {messages.length === 0 && (
          <div class="text-center text-gray-400 mt-10">
            Start chatting with {AVAILABLE_BOTS.find(b => b.id === selectedBot)?.name}...
          </div>
        )}
        {messages.map((msg) => (
          <div class={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
            msg.sender === 'user' 
              ? 'bg-blue-500 text-white self-end ml-auto' 
              : 'bg-gray-200 text-gray-800'
          }`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div class="p-3 rounded-lg max-w-[80%] bg-gray-100 text-gray-500 self-start flex items-center gap-1">
            <span class="animate-pulse"> </span>
            <span class="animate-[bounce_1s_infinite_0ms]">.</span>
            <span class="animate-[bounce_1s_infinite_100ms]">.</span>
            <span class="animate-[bounce_1s_infinite_200ms]">.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} class="mt-4 flex gap-2">
        <input 
          value={input} 
          onInput={(e) => setInput(e.target.value)} 
          disabled={isLoading}
          class="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Type your message..."
        />
        <button 
          type="submit" 
          disabled={isLoading}
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}