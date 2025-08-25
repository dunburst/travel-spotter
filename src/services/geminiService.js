// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("Vui lòng cung cấp API Key của bạn trong file .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// --- THAY ĐỔI DUY NHẤT Ở ĐÂY ---
// Sử dụng model 'gemini-1.5-pro-latest' mà tài khoản của bạn hỗ trợ.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// 1. Tạo một "Knowledge Base" từ nội dung trang IntroducePage của bạn
const knowledgeBase = `
Thông tin về nền tảng TravelSuggest dành cho đối tác kinh doanh:

**Mục tiêu chính:** Kết nối trực tiếp doanh nghiệp (nhà hàng, homestay, tour du lịch, quán cà phê...) với hàng ngàn du khách đang tìm kiếm địa điểm và dịch vụ.

**Các lợi ích chính:**
- **Tiếp cận đúng khách hàng:** Hiển thị doanh nghiệp của bạn cho du khách đang có nhu cầu thực sự tại khu vực.
- **Chủ động quản lý:** Dễ dàng cập nhật thông tin, hình ảnh, dịch vụ.
- **Đo lường hiệu quả:** Cung cấp báo cáo, thống kê về lượt xem và tương tác.
- **Tăng hiển thị:** Có thể tạo chiến dịch quảng cáo để được ưu tiên xuất hiện.

**Quy trình hoạt động (4 bước):**
1.  **Đăng ký tài khoản:** Tạo tài khoản và chờ phê duyệt.
2.  **Quản lý địa điểm:** Đăng tải, cập nhật thông tin chi tiết.
3.  **Tạo chiến dịch:** Thiết lập quảng cáo để thu hút chú ý.
4.  **Theo dõi & Phân tích:** Xem báo cáo để tối ưu chiến lược.

**Bảng giá dịch vụ:**
- **Gói Cơ bản:** Miễn phí. Bao gồm hiển thị cơ bản, quản lý thông tin, nhận đánh giá.
- **Gói Nâng cao:** 1.500.000 VNĐ/tháng. Gồm mọi thứ của gói Cơ bản, cộng thêm ưu tiên hiển thị, tạo chiến dịch quảng cáo và có báo cáo chi tiết.
- **Gói Doanh nghiệp:** Giá liên hệ. Gồm mọi thứ của gói Nâng cao, cộng thêm hỗ trợ chuyên biệt và tích hợp API.

**Câu hỏi thường gặp (FAQ):**
- **Đăng ký thế nào?** Điền form đăng ký, chúng tôi sẽ duyệt trong 24 giờ.
- **Hủy gói được không?** Có, bạn có thể hủy bất cứ lúc nào trong trang quản trị.
- **Thanh toán ra sao?** Hàng tháng qua thẻ tín dụng, chuyển khoản ngân hàng, hoặc ví điện tử.
`;

// 2. Cập nhật lại "lịch sử trò chuyện" ban đầu (Initial Prompt)
const chat = model.startChat({
    history: [
        {
            role: "user",
            // Ra lệnh cho AI đóng vai và sử dụng kiến thức được cung cấp
            parts: [{ text: `Bạn là một trợ lý ảo chuyên nghiệp của nền tảng TravelSuggest. Nhiệm vụ của bạn là tư vấn cho các doanh nghiệp tiềm năng về dịch vụ của chúng tôi. **Hãy luôn dựa vào thông tin được cung cấp dưới đây để trả lời câu hỏi của khách hàng. Không tự ý bịa đặt thông tin.** Nếu khách hàng hỏi những câu không liên quan, hãy lịch sự từ chối và hướng họ quay lại chủ đề.
            
            --- BẮT ĐẦU KHỐI KIẾN THỨC ---
            ${knowledgeBase}
            --- KẾT THÚC KHỐI KIẾN THỨC ---
            ` }],
        },
        {
            role: "model",
            // Lời chào mặc định của bot
            parts: [{ text: "Chào bạn! Tôi là trợ lý ảo của TravelSuggest. Tôi có thể giúp gì cho bạn về việc hợp tác và quảng cáo trên nền tảng của chúng tôi?" }],
        },
    ],
    generationConfig: {
        maxOutputTokens: 300, // Tăng giới hạn token để có câu trả lời dài hơn nếu cần
    },
});

// Hàm gửi tin nhắn không thay đổi
export const sendMessageToGemini = async (message) => {
    try {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn đến Gemini:", error);
        return "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.";
    }
};