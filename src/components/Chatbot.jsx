import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import useChat from '../controllers/useChat';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isLoading, isConnected, sendMessage } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cho phép mở chatbot từ nút bên ngoài trang
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openChatbot', handleOpen);
    return () => window.removeEventListener('openChatbot', handleOpen);
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <>
      {isOpen ? (
        <Draggable handle=".chat-header" bounds="parent">
          <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
            <div className="card animate-fade-in" style={{ width: '380px', height: '550px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' }}>
              
              <div className="chat-header" style={{ cursor: 'move', backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Trợ lý AI Phường</span>
                  {isConnected && <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.3)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Online</span>}
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>
              
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{ 
                    alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                    backgroundColor: msg.isBot ? 'white' : 'var(--primary)',
                    color: msg.isBot ? 'var(--dark)' : 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.isBot ? '1rem 1rem 1rem 0' : '1rem 1rem 0 1rem',
                    boxShadow: 'var(--shadow-sm)',
                    maxWidth: '85%',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                ))}
                
                {isLoading && (
                  <div style={{ alignSelf: 'flex-start', backgroundColor: 'white', padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '1rem', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '0.5rem', backgroundColor: 'white' }}>
                <input 
                  type="text" 
                  placeholder="Hỏi về thủ tục, sự cố..." 
                  className="input-field"
                  style={{ padding: '0.75rem 1rem', flex: 1 }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                />
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }} 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </Draggable>
      ) : (
        <button 
          className="btn-primary animate-fade-in"
          style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', zIndex: 9999, cursor: 'pointer', fontSize: '1.5rem' }}
          onClick={() => setIsOpen(true)}
        >
          Chat
        </button>
      )}
      
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
