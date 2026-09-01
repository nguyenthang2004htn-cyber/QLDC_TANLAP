import { WebSocketServer } from 'ws';
import chatController from '../controllers/chat.controller.js';

let clientCounter = 0;

let globalWss = null;

/**
 * Khởi tạo WebSocket server tích hợp với HTTP server
 */
const initWebSocket = (httpServer) => {
  const wss = new WebSocketServer({ server: httpServer });
  globalWss = wss;

  wss.on('connection', (ws) => {
    const clientId = `client_${++clientCounter}_${Date.now()}`;
    console.log(`WebSocket: Client ${clientId} đã kết nối`);

    ws.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === 'message' && data.text) {
          // Gửi trạng thái đang xử lý
          ws.send(JSON.stringify({ type: 'typing' }));

          // Xử lý tin nhắn qua chat controller
          const reply = await chatController.handleMessage(clientId, data.text);
          ws.send(JSON.stringify(reply));
        }
      } catch (err) {
        console.error('WebSocket error:', err.message);
        ws.send(JSON.stringify({
          type: 'reply',
          text: 'Lỗi xử lý tin nhắn. Vui lòng thử lại.',
        }));
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket: Client ${clientId} đã ngắt kết nối`);
      chatController.removeSession(clientId);
    });

    ws.on('error', (err) => {
      console.error(`WebSocket client error:`, err.message);
    });
  });

  console.log('WebSocket server đã được khởi tạo');
  return wss;
};

export const broadcastMessage = (data) => {
  if (!globalWss) return;
  globalWss.clients.forEach((client) => {
    if (client.readyState === 1 /* WebSocket.OPEN */) {
      client.send(JSON.stringify(data));
    }
  });
};

export default initWebSocket;
