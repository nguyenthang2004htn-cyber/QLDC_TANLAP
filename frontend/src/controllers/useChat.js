import { useState, useEffect, useRef, useCallback } from 'react';

const getWsUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE || '';
  if (apiBase) {
    try {
      const url = new URL(apiBase);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}`;
    } catch (e) {
      // fallback
    }
  }
  return `ws://${window.location.hostname}:3000`;
};

const WS_URL = getWsUrl();

/**
 * Controller hook quản lý WebSocket chat connection
 * Gửi/nhận messages realtime, auto-reconnect
 */
const useChat = () => {
  const [messages, setMessages] = useState([
    { text: 'Xin chào! Tôi là Trợ lý ảo AI của Phường. Tôi có thể giúp gì cho bạn về các thủ tục hành chính hoặc các vấn đề trong khu phố?', isBot: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket: Đã kết nối');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'typing') {
            setIsLoading(true);
          } else if (data.type === 'reply') {
            setMessages((prev) => [...prev, { text: data.text, isBot: true }]);
            setIsLoading(false);
          }
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsLoading(false);
        console.log('WebSocket: Đã ngắt kết nối');
        // Auto-reconnect sau 3 giây
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
        setIsLoading(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    // Thêm tin nhắn của user vào danh sách
    setMessages((prev) => [...prev, { text, isBot: false }]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', text }));
    } else {
      // Nếu chưa kết nối WebSocket
      setMessages((prev) => [
        ...prev,
        { text: 'Không thể kết nối đến server. Đang thử kết nối lại...', isBot: true },
      ]);
      connect();
    }
  }, [connect]);

  const resetMessages = useCallback(() => {
    setMessages([
      { text: 'Xin chào! Tôi là Trợ lý ảo AI của Phường. Tôi có thể giúp gì cho bạn?', isBot: true },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    resetMessages,
  };
};

export default useChat;
