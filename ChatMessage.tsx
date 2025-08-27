
import React from 'react';
import { Author, Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
  
    return (
      <div>
        {lines.map((line, i) => {
          if (line.startsWith('* ')) {
            return <li key={i} className="ml-5 list-disc">{line.substring(2)}</li>;
          }
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i} className="mb-2 last:mb-0">
              {parts.map((part, j) => 
                part.startsWith('**') && part.endsWith('**') ? 
                <strong key={j}>{part.slice(2, -2)}</strong> : 
                part
              )}
            </p>
          );
        })}
      </div>
    );
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.author === Author.BOT;

  const botAvatar = (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      AI
    </div>
  );

  const userAvatar = (
    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      U
    </div>
  );

  return (
    <div className={`flex items-start gap-3 my-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && botAvatar}
      <div
        className={`max-w-xl rounded-lg p-4 text-sm shadow-md ${
          isBot ? 'bg-white text-gray-800 rounded-tl-none' : 'bg-indigo-500 text-white rounded-br-none'
        }`}
      >
        <MarkdownRenderer text={message.content} />
      </div>
      {!isBot && userAvatar}
    </div>
  );
};

export default ChatMessage;
