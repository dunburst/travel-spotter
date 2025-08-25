import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

// ==================================================
// ===  API LOGIC (Tích hợp trực tiếp để sửa lỗi import) ===
// ==================================================
// Cấu hình axios instance tương tự như file api.js của bạn
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động đính kèm token vào mỗi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Khai báo các hàm gọi API
const addLocation = (locationData) => api.post('/api/locations', locationData);
const createAd = (adData) => api.post('/api/ads', adData);
const createVnPayUrl = (paymentData) => api.post('/api/payment/create-payment', paymentData);
// ==================================================


// Component bản đồ dùng Iframe để tránh lỗi biên dịch và tương thích môi trường
function MapPickerIframe({ initialPosition }) {
    const getMapHtml = (lat, lng) => `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Leaflet Map</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; width: 100vw; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                const map = L.map('map').setView([${lat}, ${lng}], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                let marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

                function postLocation() {
                    const { lat, lng } = marker.getLatLng();
                    window.parent.postMessage({
                        type: 'location_change',
                        payload: { lat, lng }
                    }, '*');
                }

                marker.on('dragend', postLocation);
                map.on('click', function(e) {
                    marker.setLatLng(e.latlng);
                    postLocation();
                });
            </script>
        </body>
        </html>
    `;

    return (
        <iframe
            title="Map Picker"
            srcDoc={getMapHtml(initialPosition.lat, initialPosition.lng)}
            style={{ width: '100%', height: '100%', border: 'none' }}
        />
    );
}


function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]); // State để lưu danh mục

    // State cho Step 1: Địa điểm
    const [locationData, setLocationData] = useState({
        name: '',
        address: '',
        description: '',
        phoneNumber: '',
        website: 'https://',
        operatingHours: '',
        categoryId: '', // Để trống ban đầu
        latitude: 21.028511, // Tọa độ mặc định: Hà Nội
        longitude: 105.804817,
    });
    const [createdLocation, setCreatedLocation] = useState(null);

    // State cho Step 2: Chiến dịch
    const [campaignData, setCampaignData] = useState({
        title: '',
        content: '',
        startDate: '',
        endDate: '',
        budget: 500000,
        targetAudience: 'Mọi du khách',
        type: 'BANNER',
        status: 'PENDING',
    });
    const [createdCampaign, setCreatedCampaign] = useState(null);
    
    // Giả lập việc fetch categories khi component mount
    useEffect(() => {
        // Trong thực tế bạn sẽ gọi API để lấy danh sách category
        const fetchedCategories = [
            { id: 1, name: 'Nhà hàng' },
            { id: 2, name: 'Khách sạn' },
            { id: 3, name: 'Địa điểm tham quan' },
            { id: 4, name: 'Quán cà phê' },
        ];
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
            setLocationData(prev => ({ ...prev, categoryId: fetchedCategories[0].id }));
        }
    }, []);


    // Lắng nghe sự kiện từ Iframe bản đồ
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'location_change') {
                const { lat, lng } = event.data.payload;
                setLocationData(prev => ({ ...prev, latitude: lat, longitude: lng }));
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleLocationInputChange = (e) => {
        const { name, value } = e.target;
        setLocationData(prev => ({ ...prev, [name]: value }));
    };

    const handleCampaignInputChange = (e) => {
        const { name, value } = e.target;
        setCampaignData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // API thật
            const response = await addLocation(locationData);
            setCreatedLocation(response.data); // Giả sử API trả về { success: true, data: {...} }
            setCurrentStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Thêm địa điểm thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCampaignSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const payload = {
                ...campaignData,
                locationId: createdLocation.id,
            };
            // API thật
            const response = await createAd(payload);
            setCreatedCampaign(response.data);
            setCurrentStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Tạo chiến dịch thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        setIsLoading(true);
        setError('');
        try {
            const paymentInfo = {
                amount: createdCampaign.budget,
                orderId: createdCampaign.id, // Backend có thể tự tạo orderId khác
                orderInfo: `Thanh toan cho chien dich ${createdCampaign.title}`
            };
            // API thật
            const response = await createVnPayUrl(paymentInfo);
            if (response.data && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                throw new Error('Không thể tạo link thanh toán.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Quá trình thanh toán đã xảy ra lỗi.');
            setIsLoading(false);
        }
    };


    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <form onSubmit={handleLocationSubmit}>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Bước 1: Thêm địa điểm quảng bá</h2>
                        <p className="text-slate-400 mb-8 text-center">Điền thông tin và chọn vị trí chính xác trên bản đồ.</p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <input type="text" name="name" placeholder="Tên địa điểm" value={locationData.name} onChange={handleLocationInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                <input type="text" name="address" placeholder="Địa chỉ chi tiết" value={locationData.address} onChange={handleLocationInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                <textarea name="description" placeholder="Mô tả về địa điểm..." rows="3" value={locationData.description} onChange={handleLocationInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required></textarea>
                                <select name="categoryId" value={locationData.categoryId} onChange={handleLocationInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
                                    <option value="" disabled>Chọn danh mục</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <input type="tel" name="phoneNumber" placeholder="Số điện thoại" value={locationData.phoneNumber} onChange={handleLocationInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                <input type="url" name="website" placeholder="Website" value={locationData.website} onChange={handleLocationInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                <input type="text" name="operatingHours" placeholder="Giờ mở cửa (ví dụ: 08:00 - 22:00)" value={locationData.operatingHours} onChange={handleLocationInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <p className="text-slate-300 mb-2 font-semibold">Chọn tọa độ trên bản đồ:</p>
                                <div className="h-96 w-full rounded-lg overflow-hidden border-2 border-slate-700">
                                    <MapPickerIframe 
                                        initialPosition={{ lat: locationData.latitude, lng: locationData.longitude }} 
                                    />
                                </div>
                                <div className="mt-2 text-sm text-slate-400">
                                    <p>Vĩ độ (Latitude): <span className="font-mono text-white">{locationData.latitude.toFixed(6)}</span></p>
                                    <p>Kinh độ (Longitude): <span className="font-mono text-white">{locationData.longitude.toFixed(6)}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8">
                            <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 text-lg disabled:bg-slate-600 disabled:cursor-not-allowed">
                                {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
                            </button>
                        </div>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleCampaignSubmit}>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Bước 2: Thiết lập chiến dịch</h2>
                        <p className="text-slate-400 mb-8 text-center">Cung cấp thông tin chi tiết cho chiến dịch quảng cáo của bạn.</p>
                        
                        <div className="max-w-2xl mx-auto space-y-4">
                            <input type="text" name="title" placeholder="Tiêu đề chiến dịch" value={campaignData.title} onChange={handleCampaignInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                            <textarea name="content" placeholder="Nội dung quảng cáo..." rows="4" value={campaignData.content} onChange={handleCampaignInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required></textarea>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Ngày bắt đầu</label>
                                    <input type="date" name="startDate" value={campaignData.startDate} onChange={handleCampaignInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Ngày kết thúc</label>
                                    <input type="date" name="endDate" value={campaignData.endDate} onChange={handleCampaignInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Ngân sách (VNĐ)</label>
                                <input type="number" name="budget" placeholder="Ngân sách tổng" value={campaignData.budget} onChange={handleCampaignInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required min="50000" />
                            </div>
                            <input type="text" name="targetAudience" placeholder="Đối tượng mục tiêu (ví dụ: Gia đình, Cặp đôi)" value={campaignData.targetAudience} onChange={handleCampaignInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Loại quảng cáo</label>
                                <select name="type" value={campaignData.type} onChange={handleCampaignInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                    <option value="BANNER">Banner</option>
                                    <option value="POPUP">Popup</option>
                                    <option value="NOTIFICATION">Thông báo đẩy</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8 gap-4">
                             <button type="button" onClick={() => setCurrentStep(1)} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg">
                                Quay lại
                            </button>
                            <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 text-lg disabled:bg-slate-600 disabled:cursor-not-allowed">
                                {isLoading ? 'Đang tạo...' : 'Tiếp tục'}
                            </button>
                        </div>
                    </form>
                );
            case 3:
                return (
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Bước 3: Xác nhận và Thanh toán</h2>
                        <p className="text-slate-400 mb-8 text-center">Vui lòng kiểm tra lại thông tin trước khi thanh toán qua VNPAY.</p>
                        
                        <div className="max-w-2xl mx-auto bg-slate-900 p-6 rounded-lg border border-slate-700 space-y-4">
                            <div>
                                <h3 className="font-bold text-lg text-blue-400">Thông tin địa điểm</h3>
                                <p><strong>Tên:</strong> {createdLocation?.name}</p>
                                <p><strong>Địa chỉ:</strong> {createdLocation?.address}</p>
                            </div>
                            <div className="border-t border-slate-700 pt-4">
                                <h3 className="font-bold text-lg text-blue-400">Thông tin chiến dịch</h3>
                                <p><strong>Tiêu đề:</strong> {createdCampaign?.title}</p>
                                <p><strong>Thời gian:</strong> {createdCampaign?.startDate} - {createdCampaign?.endDate}</p>
                                <p><strong>Đối tượng:</strong> {createdCampaign?.targetAudience}</p>
                            </div>
                             <div className="border-t border-slate-700 pt-4 text-center">
                                <p className="text-slate-400">Tổng chi phí</p>
                                <p className="text-3xl font-bold text-white">{Number(createdCampaign?.budget).toLocaleString('vi-VN')} VNĐ</p>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8 gap-4">
                             <button type="button" onClick={() => setCurrentStep(2)} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg">
                                Quay lại
                            </button>
                            <button onClick={handlePayment} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 text-lg disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2">
                               {isLoading ? 'Đang chuyển hướng...' : 'Thanh toán với VNPAY'}
                               <img src="https://vnpay.vn/s1/statics.vnpay.vn/vnpay_jsp/images/logo/vnpay_logo.svg" alt="VNPAY" className="h-6"/>
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div>Lỗi: Bước không hợp lệ.</div>;
        }
    };

    return (
        <div className="bg-slate-900 text-slate-200 flex items-center justify-center min-h-screen p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-10 transition-all duration-500">
                <div id="step-content">
                    {renderStep()}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default OnboardingPage;
