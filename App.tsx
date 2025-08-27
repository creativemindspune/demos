
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from "@google/genai";
import { startChatSession } from './services/geminiService';
import { Author, Message } from './types';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const session = startChatSession();
      setChatSession(session);
      // Add initial bot message
       setMessages([{
        author: Author.BOT,
        content: "Welcome to SSB Travelz! I'm your personal AI Concierge. How can I assist you with your travel plans today? You can ask me about our packages, like 'tell me about the Thailand package' or 'suggest a spiritual tour'."
      }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatSession) return;

    const userMessage: Message = { author: Author.USER, content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chatSession.sendMessageStream({ message: userInput });
      
      let botResponse = '';
      setMessages(prev => [...prev, { author: Author.BOT, content: '' }]);

      for await (const chunk of stream) {
        botResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = botResponse;
          return newMessages;
        });
      }
    } catch (err) {
      const errorMessage = "Sorry, I'm having trouble connecting. Please try again in a moment.";
      setError(errorMessage);
       setMessages(prev => [...prev, { author: Author.BOT, content: errorMessage }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center gap-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">SSB Travelz Concierge</h1>
                <p className="text-sm text-gray-500">Your Personal AI Travel Assistant</p>
            </div>
        </div>
      </header>
      
      <main ref={chatWindowRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        <div className="container mx-auto max-w-3xl">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && messages[messages.length - 1]?.author === Author.USER && (
             <div className="flex items-start gap-3 my-4 justify-start">
                 <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
                 <div className="bg-white text-gray-800 rounded-lg rounded-tl-none p-4 text-sm shadow-md">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    </div>
                 </div>
             </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      </main>

      <footer className="bg-white border-t p-4">
        <div className="container mx-auto max-w-3xl">
          <form onSubmit={handleSendMessage} className="flex items-center bg-gray-100 rounded-full px-2 py-1 focus-within:ring-2 focus-within:ring-indigo-500">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about our travel packages..."
              className="flex-grow bg-transparent border-none focus:ring-0 p-3 text-gray-700 placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-indigo-600 text-white rounded-full p-3 disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default App;
