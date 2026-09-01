import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';

let genAI = null;
let model = null;

if (API_KEY && API_KEY !== 'your_api_key_here') {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction:
      'Bạn là "Trợ lý ảo hành chính Phường", một AI thân thiện, chuyên nghiệp, phục vụ người dân của phường trực thuộc thành phố Phan Thiết. ' +
      'Nhiệm vụ của bạn là giải đáp các thủ tục hành chính, hướng dẫn gửi phản ánh sự cố (cúp điện, nước, tai nạn, an ninh, rác thải) qua trang web, ' +
      'và cung cấp thông tin chính xác. Trả lời ngắn gọn, súc tích, lịch sự và dễ hiểu.',
  });
}

// Lưu trữ chat sessions theo client ID
const sessions = new Map();

const chatController = {
  /**
   * Xử lý tin nhắn từ WebSocket client
   */
  async handleMessage(clientId, text) {
    // Nếu chưa có API key
    if (!model) {
      return {
        type: 'reply',
        text: 'Hệ thống AI hiện chưa được cấu hình API Key. Vui lòng thêm GEMINI_API_KEY vào file .env ở thư mục gốc của dự án.',
      };
    }

    try {
      // Lấy hoặc tạo session cho client
      let session = sessions.get(clientId);
      if (!session) {
        session = model.startChat({
          history: [],
          generationConfig: { maxOutputTokens: 600 },
        });
        sessions.set(clientId, session);
      }

      const result = await session.sendMessage(text);
      const responseText = result.response.text();

      return { type: 'reply', text: responseText };
    } catch (error) {
      console.error('Lỗi Gemini API:', error.message);
      return {
        type: 'reply',
        text: 'Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.',
      };
    }
  },

  /**
   * Xóa session khi client disconnect
   */
  removeSession(clientId) {
    sessions.delete(clientId);
  },
};

export default chatController;
