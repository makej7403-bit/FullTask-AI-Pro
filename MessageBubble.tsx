import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, Globe, Image as ImageIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-fade-in`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-indigo-600' : 'bg-brand-gold'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-black" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            rounded-2xl px-5 py-4 shadow-md
            ${isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : 'bg-brand-800 border border-white/5 text-slate-200 rounded-tl-sm glass-panel'
            }
          `}>
            {message.imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                <img src={message.imageUrl} alt="Uploaded" className="max-w-full max-h-64 object-cover" />
              </div>
            )}
            
            {message.isLoading ? (
              <div className="flex space-x-2 h-6 items-center">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <div className="markdown-body text-sm md:text-base">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Grounding / Sources */}
          {message.groundingMetadata?.web && (
             <div className="mt-2 text-xs flex flex-wrap gap-2 max-w-full">
               <span className="text-slate-500 flex items-center gap-1 font-medium uppercase tracking-wider scale-90 origin-left">
                 <Globe size={12} /> Sources
               </span>
               {message.groundingMetadata.web.map((link, idx) => (
                 <a 
                   key={idx} 
                   href={link.uri} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="bg-brand-800/80 hover:bg-brand-700 text-brand-accent px-2 py-1 rounded border border-brand-accent/20 truncate max-w-[200px] transition-colors"
                 >
                   {link.title || link.uri}
                 </a>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
