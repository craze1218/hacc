import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse, ChatMessage } from '../services/geminiService';
import { MessageIcon, SendIcon, CloseIcon, MinimizeIcon } from './icons';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your technical assistant. I can help you with programming questions, career guidance, learning resources, and more. What would you like to know?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get conversation history (last 10 messages for context)
      const conversationHistory = [...messages, userMessage].slice(-10);
      const response = await generateChatResponse(inputMessage.trim(), conversationHistory);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again in a moment.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your technical assistant. I can help you with programming questions, career guidance, learning resources, and more. What would you like to know?",
      },
    ]);
  };

  // Render markdown-like formatting (simple implementation)
  const renderMessage = (content: string) => {
    // Convert code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let processedContent = content;
    
    // Process code blocks
    processedContent = processedContent.replace(codeBlockRegex, (match, lang, code) => {
      return `<pre class="code-block"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });
    
    // Process inline code
    processedContent = processedContent.replace(inlineCodeRegex, (match, code) => {
      return `<code class="inline-code">${code}</code>`;
    });
    
    // Convert line breaks
    processedContent = processedContent.replace(/\n/g, '<br />');
    
    return { __html: processedContent };
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
          aria-label="Open chatbot"
        >
          <MessageIcon className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-[var(--card-background)] border border-[var(--card-border)] rounded-xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-8rem)]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] rounded-t-xl">
            <div className="flex items-center gap-2">
              <MessageIcon className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">Technical Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                <MinimizeIcon className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Close chatbot"
              >
                <CloseIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)]'
                      }`}
                    >
                      <div
                        className="text-sm leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={renderMessage(message.content)}
                      />
                      <style>{`
                        .prose code.inline-code {
                          background: var(--card-background);
                          padding: 2px 6px;
                          border-radius: 4px;
                          font-family: 'Courier New', monospace;
                          font-size: 0.9em;
                        }
                        .prose pre.code-block {
                          background: var(--card-background);
                          border: 1px solid var(--card-border);
                          border-radius: 6px;
                          padding: 12px;
                          overflow-x: auto;
                          margin: 8px 0;
                        }
                        .prose pre.code-block code {
                          font-family: 'Courier New', monospace;
                          font-size: 0.85em;
                          color: var(--foreground);
                        }
                      `}</style>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[var(--muted-foreground)]">Thinking</span>
                        <div className="flex gap-1 ml-2">
                          <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[var(--card-border)] bg-[var(--background)]">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a technical question..."
                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--card-background)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    aria-label="Send message"
                  >
                    <SendIcon className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleClearChat}
                  className="mt-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Clear chat
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;

