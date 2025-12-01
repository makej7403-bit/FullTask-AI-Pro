import React, { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { signInWithGoogle } from './firebase';
import { Layout } from './components/Layout';
import { MessageBubble } from './components/MessageBubble';
import { sendMessageToOpenAI } from './services/openaiService';
import { Message, ModelType, ChatSession } from './types';
import { Send, Menu, Paperclip, Image as ImageIcon, Search, Zap, Loader2, Mic, MicOff, AlertCircle, Key, CheckCircle, X } from 'lucide-react';

// INITIAL MESSAGE TEMPLATE
const getWelcomeMessage = (): Message => ({
  id: 'welcome',
  role: 'model',
  text: `**Welcome to FullTask AI Pro.** \n\nI am your advanced assistant, created by Akin S. Sokpah from Liberia. \n\nI possess 10+ exclusive features including:\n*   Advanced Coding & Debugging\n*   Real-time Web Search\n*   Vision & Image Analysis\n*   Logical Reasoning\n\nHow can I assist you today?`,
  timestamp: Date.now()
});

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px]" />

      <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-md w-full relative z-10 text-center border border-white/10 shadow-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-accent to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-8">
           <Zap className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">FullTask AI Pro</h1>
        <p className="text-slate-400 mb-8">The exclusive AI experience created by Akin S. Sokpah. Unlock advanced reasoning and multimodal powers.</p>
        
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-white text-brand-900 font-bold py-4 px-6 rounded-xl hover:bg-slate-100 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              <span>Continue with Google</span>
            </>
          )}
        </button>
        <p className="mt-6 text-xs text-slate-500">By continuing, you agree to our Terms of Exclusive Service.</p>
      </div>
    </div>
  );
};

const ApiKeyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = localStorage.getItem('openai_api_key');
      if (existing) setKey(existing);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (key.trim().startsWith('sk-')) {
      localStorage.setItem('openai_api_key', key.trim());
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
        window.location.reload(); // Reload to pick up the new key in service
      }, 1000);
    } else {
      alert("Invalid API Key format. It should start with 'sk-'.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-brand-800 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="text-brand-gold" size={20} />
            API Configuration
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        
        <p className="text-slate-400 text-sm mb-4">
          To use FullTask AI Pro, please provide your OpenAI API Key. Your key is stored locally in your browser and never sent to our servers.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">OpenAI API Key</label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-accent transition-colors font-mono text-sm"
            />
          </div>
          
          <button 
            onClick={handleSave}
            disabled={!key || saved}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500 text-white' : 'bg-brand-accent text-brand-900 hover:bg-blue-400'}`}
          >
            {saved ? <><CheckCircle size={18} /> Saved!</> : 'Save & Reload'}
          </button>

          <p className="text-center text-[10px] text-slate-600">
             Get your key from platform.openai.com
          </p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  
  // SESSION MANAGEMENT
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [modelType, setModelType] = useState<ModelType>(ModelType.STANDARD);
  const [isListening, setIsListening] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load from LocalStorage on Mount
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('fulltask_ai_sessions');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id); // Select most recent
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse history", e);
      localStorage.removeItem('fulltask_ai_sessions'); // Clear corrupt data
    }
    // Init default if empty or corrupt
    createNewSession();
  }, []);

  // Save to LocalStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('fulltask_ai_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, loading]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [getWelcomeMessage()],
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.setItem('fulltask_ai_sessions', JSON.stringify(newSessions));
    
    if (currentSessionId === id) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const getCurrentMessages = () => {
    return sessions.find(s => s.id === currentSessionId)?.messages || [];
  };

  const updateCurrentSessionMessages = (newMessages: Message[], newTitle?: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { 
          ...s, 
          messages: newMessages,
          title: newTitle || s.title
        };
      }
      return s;
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const userText = input;
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const currentMessages = getCurrentMessages();
    const isFirstUserMessage = currentMessages.length === 1 && currentMessages[0].id === 'welcome';

    // 1. Add User Message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText || (currentImage ? "Analyze this image" : ""),
      timestamp: Date.now(),
      imageUrl: currentImage || undefined
    };

    // 2. Add Placeholder Bot Message for Streaming
    const botMessageId = (Date.now() + 1).toString();
    const placeholderBotMessage: Message = {
      id: botMessageId,
      role: 'model',
      text: "", // Starts empty
      timestamp: Date.now(),
      isLoading: true
    };

    const initialUpdatedMessages = [...currentMessages, newUserMessage, placeholderBotMessage];
    
    // Update title if it's the first message
    let newTitle = undefined;
    if (isFirstUserMessage) {
      const cleanText = userText.replace(/[^\w\s]/gi, '');
      newTitle = cleanText.slice(0, 30) + (cleanText.length > 30 ? '...' : '') || "Image Analysis";
    }

    updateCurrentSessionMessages(initialUpdatedMessages, newTitle);
    setLoading(true);

    try {
      // Prepare history (excluding the current user message and the placeholder)
      const history = currentMessages.map(m => ({
        role: m.role,
        text: m.text,
        imageUrl: m.imageUrl
      }));

      const cleanBase64 = currentImage ? currentImage.split(',')[1] : undefined;

      // Call OpenAI with Streaming Callback
      await sendMessageToOpenAI(
        userText || "What is in this image?", 
        history,
        modelType,
        cleanBase64,
        (streamedText) => {
          // Update the specific bot message in real-time
          setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
              return { 
                ...s, 
                messages: s.messages.map(m => 
                  m.id === botMessageId 
                    ? { ...m, text: streamedText, isLoading: false } 
                    : m
                )
              };
            }
            return s;
          }));
        }
      );

    } catch (error: any) {
      console.error(error);
      
      if (error.message === "MISSING_API_KEY") {
        setShowApiKeyModal(true);
        // Remove the failed message exchange or allow retry?
        // For now, let's update the message to inform user
        const errorMessage = `**Action Required:** Please enter your OpenAI API Key in settings to proceed.`;
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
             return { 
                ...s, 
                messages: s.messages.map(m => 
                  m.id === botMessageId 
                    ? { ...m, text: errorMessage, isLoading: false } 
                    : m
                )
             };
          }
          return s;
        }));
      } else {
        const errorMessage = `**System Error:** ${error.message || "Connection failed."}`;
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return { 
              ...s, 
              messages: s.messages.map(m => 
                m.id === botMessageId 
                  ? { ...m, text: errorMessage, isLoading: false } 
                  : m
              )
            };
          }
          return s;
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      sidebarOpen={sidebarOpen} 
      setSidebarOpen={setSidebarOpen}
      sessions={sessions}
      currentSessionId={currentSessionId}
      onSelectSession={(id) => { setCurrentSessionId(id); if (window.innerWidth < 768) setSidebarOpen(false); }}
      onNewSession={createNewSession}
      onDeleteSession={deleteSession}
      onOpenSettings={() => setShowApiKeyModal(true)}
    >
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
      
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-brand-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-lg md:hidden">
            <Menu size={20} className="text-slate-300" />
          </button>
          <div className="hidden md:flex flex-col">
            <h2 className="font-semibold text-slate-100">FullTask AI Pro</h2>
            <div className="flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-[10px] text-slate-400 uppercase tracking-wide">Online • Exclusive</span>
            </div>
          </div>
        </div>
        
        <div className="flex bg-brand-800 rounded-lg p-1 border border-white/10">
           <button 
             onClick={() => setModelType(ModelType.STANDARD)}
             className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${modelType === ModelType.STANDARD ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
           >
             Chat
           </button>
           <button 
             onClick={() => setModelType(ModelType.SEARCH)}
             className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${modelType === ModelType.SEARCH ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
           >
             <Search size={12} /> Search
           </button>
           <button 
             onClick={() => setModelType(ModelType.PRO)}
             className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${modelType === ModelType.PRO ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
           >
             Pro+
           </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {getCurrentMessages().map(m => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {/* Removed generic loader in favor of streaming message bubble */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-brand-900 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          {selectedImage && (
            <div className="mb-2 inline-flex items-center gap-2 bg-brand-800 px-3 py-2 rounded-lg border border-white/10 animate-fade-in">
              <img src={selectedImage} alt="Preview" className="w-8 h-8 rounded object-cover" />
              <span className="text-xs text-slate-300">Image attached</span>
              <button onClick={() => setSelectedImage(null)} className="text-slate-500 hover:text-white ml-2"><span className="sr-only">Remove</span>×</button>
            </div>
          )}
          
          <div className="relative flex items-end gap-2 bg-brand-800/50 border border-white/10 rounded-xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-brand-accent/50 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
              title="Upload Image"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageSelect}
            />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? "Listening..." : "Ask FullTask AI Pro..."}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm md:text-base p-3 focus:outline-none resize-none max-h-32"
              rows={1}
              style={{ minHeight: '48px' }}
            />

            <button 
              onClick={toggleListening}
              className={`p-3 rounded-lg transition-all duration-200 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="Voice Input"
            >
               {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || loading}
              className={`p-3 rounded-lg transition-all duration-200 ${(!input.trim() && !selectedImage) || loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-brand-accent text-brand-900 hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/30'}`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            FullTask AI Pro - Created by Akin S. Sokpah. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-brand-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-accent w-10 h-10" />
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginScreen />;
};

const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;