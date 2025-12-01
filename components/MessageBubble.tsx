import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, Globe, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: Message;
}

const CodeBlock = ({ language, children }: { language: string, children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden my-4 border border-white/10 shadow-lg group">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-white/5">
        <span className="text-xs font-mono text-slate-400 lowercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors opacity-70 group-hover:opacity-100"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e', fontSize: '0.85rem' }}
        wrapLines={true}
        wrapLongLines={true}
        PreTag="div"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-fade-in`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-indigo-600' : 'bg-brand-gold'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-black" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
          <div className={`
            rounded-2xl px-5 py-4 shadow-md w-full
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
                <ReactMarkdown
                  components={{
                    // Unwrap 'pre' to avoid nested pre tags when using SyntaxHighlighter
                    pre: ({children}) => <>{children}</>,
                    code({node, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeContent = String(children).replace(/\n$/, '');
                      
                      if (match) {
                        return <CodeBlock language={match[1]}>{codeContent}</CodeBlock>;
                      }
                      
                      return (
                        <code className={`${className} bg-black/20 text-brand-accent px-1.5 py-0.5 rounded text-sm font-mono break-words`} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.text}
                </ReactMarkdown>
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
