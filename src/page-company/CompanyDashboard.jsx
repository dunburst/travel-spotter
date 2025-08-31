// src/page-company/CompanyDashboard.jsx
import React from 'react';
import { FaEye, FaStar, FaMousePointer, FaDownload, FaUsers, FaExchangeAlt } from 'react-icons/fa';
import '../page-staff/Dashboard.css'; // Tái sử dụng CSS
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// --- Dữ liệu mẫu ---
const statData = {
    reach: { value: "12,450", change: "+12.5%", changeType: "increase" },
    interactions: { value: "1,408", change: "+8.2%", changeType: "increase" },
    avgRating: { value: "4.7 / 5", subtitle: "Dựa trên 282 đánh giá" },
    conversionRate: { value: "11.3%", change: "+1.1%", changeType: "increase" }
};

const adCampaignData = [
    { name: 'KM Hè', views: 8200, ctr: 5.5 },
    { name: 'Combo CB', views: 7900, ctr: 6.2 },
    { name: 'Món mới', views: 4500, ctr: 4.1 },
    { name: 'Tháng 4', views: 6100, ctr: 5.8 },
    { name: 'Tháng 5', views: 7000, ctr: 6.5 }
];

const customerInteractionData = [
    { name: 'T2', views: 65, likes: 40 },
    { name: 'T3', views: 78, likes: 45 },
    { name: 'T4', views: 70, likes: 55 },
    { name: 'T5', views: 95, likes: 60 },
    { name: 'T6', views: 130, likes: 80 },
    { name: 'T7', views: 160, likes: 100 },
    { name: 'CN', views: 210, likes: 120 }
];

const monthlyRatingDistribution = [
    { name: '5 Sao', value: 120, color: '#22c55e' },
    { name: '4 Sao', value: 50, color: '#84cc16' },
    { name: '3 Sao', value: 15, color: '#facc15' },
    { name: '2 Sao', value: 5, color: '#f97316' },
    { name: '1 Sao', value: 2, color: '#ef4444' },
];

const featuredReviewsData = [
    { id: 1, author: 'Nguyễn Văn An', rating: 5, comment: 'Dịch vụ tuyệt vời, không gian thoáng đãng và sạch sẽ. Chắc chắn sẽ quay lại!', time: '2 ngày trước', avatarUrl: 'https://i.pravatar.cc/150?u=an_nguyen' },
    { id: 2, author: 'Trần Thị Bích', rating: 4, comment: 'Đồ ăn ngon nhưng phục vụ hơi chậm vào cuối tuần. Nhìn chung là ổn.', time: '5 ngày trước', avatarUrl: 'https://i.pravatar.cc/150?u=bich_tran' },
    { id: 3, author: 'Le Hoang', rating: 5, comment: 'Một trải nghiệm không thể quên. Nhân viên thân thiện và rất nhiệt tình. Highly recommended!', time: '1 tuần trước', avatarUrl: 'https://i.pravatar.cc/150?u=hoang_le' }
];


// --- Component con ---
const StatCardV2 = ({ title, data, icon, color }) => {
    const changeColor = data.changeType === 'increase' ? 'text-green-500' : 'text-red-500';
    return (
        <div className="stat-card-v2">
            <div className={`stat-icon-v2 icon-${color}`}>{icon}</div>
            <div className="stat-content-v2">
                <p className="stat-title-v2">{title}</p>
                <p className="stat-value-v2">{data.value}</p>
                {data.change ? (
                    <p className={`stat-change-v2 ${changeColor}`}>{data.change} so với tháng trước</p>
                ) : (
                    <p className="stat-subtitle-v2">{data.subtitle}</p>
                )}
            </div>
        </div>
    );
};

const ComboChart = ({ data, title }) => {
    const maxViews = 8500, maxCtr = 8;
    return (
        <div className="widget-card">
            <h3 className="widget-title">{title}</h3>
            <div className="chart-container">
                <svg width="100%" height="250" viewBox="0 0 500 250">
                    <g className="chart-grid y-grid">{[0, 2000, 4000, 6000, 8000].map(y => (<g key={y}><text x="35" y={200 - (y / maxViews * 180)} dy="4" textAnchor="end" className="chart-label">{y / 1000}k</text><line x1="40" x2="460" y1={200 - (y / maxViews * 180)} y2={200 - (y / maxViews * 180)} className="chart-grid-line" /></g>))}</g>
                    <g className="chart-grid y-grid-secondary">{[0, 2, 4, 6, 8].map(y => (<text key={y} x="465" y={200 - (y / maxCtr * 180)} dy="4" className="chart-label">{y}%</text>))}</g>
                    {data.map((d, i) => <rect key={i} x={60 + i * (400 / data.length)} y={200 - (d.views / maxViews * 180)} width={40} height={(d.views / maxViews * 180)} fill="#3b82f6" className="chart-bar" />)}
                    <polyline fill="none" stroke="#f97316" strokeWidth="2" points={data.map((d, i) => `${80 + i * (400 / data.length)},${200 - (d.ctr / maxCtr * 180)}`).join(' ')} />
                    {data.map((d, i) => <circle key={i} cx={80 + i * (400 / data.length)} cy={200 - (d.ctr / maxCtr * 180)} r="3" fill="#f97316" stroke="white" strokeWidth="1" />)}
                    <g className="chart-grid x-grid">{data.map((d, i) => (<text key={i} x={80 + i * (400 / data.length)} y="220" textAnchor="middle" className="chart-label">{d.name}</text>))}</g>
                </svg>
            </div>
        </div>
    );
};

const DualLineChart = ({ data, title }) => {
    const maxValue = 220;
    return (
        <div className="widget-card">
            <h3 className="widget-title">{title}</h3>
            <div className="chart-container">
                <svg width="100%" height="250" viewBox="0 0 500 250">
                    <g className="chart-grid y-grid">{[0, 50, 100, 150, 200].map(y => (<g key={y}><text x="35" y={200 - (y / maxValue * 180)} dy="4" textAnchor="end" className="chart-label">{y}</text><line x1="40" x2="480" y1={200 - (y / maxValue * 180)} y2={200 - (y / maxValue * 180)} className="chart-grid-line" /></g>))}</g>
                    <polyline fill="none" stroke="#22c55e" strokeWidth="2" points={data.map((d, i) => `${60 + i * (420 / (data.length - 1))},${200 - (d.views / maxValue * 180)}`).join(' ')} />
                    <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={data.map((d, i) => `${60 + i * (420 / (data.length - 1))},${200 - (d.likes / maxValue * 180)}`).join(' ')} />
                    <g className="chart-grid x-grid">{data.map((d, i) => (<text key={i} x={60 + i * (420 / (data.length - 1))} y="220" textAnchor="middle" className="chart-label">{d.name}</text>))}</g>
                </svg>
            </div>
        </div>
    );
};

const PieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0); let cumulativePercent = 0;
    return (
        <div className="widget-card">
            <h3 className="widget-title">{title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', height: '250px' }}>
                <svg width="150" height="150" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>{data.map((item, index) => { const percent = (item.value / total); const startAngle = cumulativePercent * 2 * Math.PI; const endAngle = (cumulativePercent + percent) * 2 * Math.PI; cumulativePercent += percent; const x1 = Math.cos(startAngle); const y1 = Math.sin(startAngle); const x2 = Math.cos(endAngle); const y2 = Math.sin(endAngle); const largeArcFlag = percent > 0.5 ? 1 : 0; return (<path key={index} d={`M ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} L 0 0 Z`} fill={item.color} />); })}</svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{data.map((item, index) => (<div key={index} style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: '12px', height: '12px', backgroundColor: item.color, marginRight: '8px', borderRadius: '2px' }}></span><span>{item.name} ({item.value})</span></div>))}</div>
            </div>
        </div>
    );
};

const FeaturedReviews = ({ data, title }) => {
    const StarRating = ({ rating }) => (<div className="star-rating-v2">{[...Array(5)].map((_, i) => (<FaStar key={i} size={14} color={i < rating ? '#f59e0b' : '#e5e7eb'} />))}</div>);
    return (
        <div className="widget-card">
            <h3 className="widget-title">{title}</h3>
            <div className="reviews-container-v2">{data.map(review => (<div key={review.id} className="review-item-v2"><img src={review.avatarUrl} alt={review.author} className="review-avatar" /><div className="review-content-v2"><div className="review-header-v2"><span className="review-author-v2">{review.author}</span><span className="review-time-v2">{review.time}</span></div><StarRating rating={review.rating} /><p className="review-comment-v2">{review.comment}</p></div></div>))}</div>
        </div>
    );
};


const CompanyDashboard = () => {
    const exportReport = () => {
        const wb = XLSX.utils.book_new(); const wsStats = XLSX.utils.json_to_sheet([{ "Thống kê": "Tổng kết tiếp cận", "Giá trị": statData.reach.value, "Thay đổi": statData.reach.change }, { "Thống kê": "Tương tác mới", "Giá trị": statData.interactions.value, "Thay đổi": statData.interactions.change }, { "Thống kê": "Đánh giá trung bình", "Giá trị": statData.avgRating.value, "Ghi chú": statData.avgRating.subtitle }, { "Thống kê": "Tỷ lệ chuyển đổi", "Giá trị": statData.conversionRate.value, "Thay đổi": statData.conversionRate.change }, ]); XLSX.utils.book_append_sheet(wb, wsStats, "ThongKeTongQuan"); const wsAdCampaigns = XLSX.utils.json_to_sheet(adCampaignData); XLSX.utils.book_append_sheet(wb, wsAdCampaigns, "HieuQuaQuangCao"); const wsCustomerInteraction = XLSX.utils.json_to_sheet(customerInteractionData); XLSX.utils.book_append_sheet(wb, wsCustomerInteraction, "TuongTacKhachHang"); const wsMonthlyRating = XLSX.utils.json_to_sheet(monthlyRatingDistribution.map(item => ({ "Tên": item.name, "Số lượng": item.value }))); XLSX.utils.book_append_sheet(wb, wsMonthlyRating, "DanhGiaTrongThang"); const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }); saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'BaoCaoHieuSuat.xlsx');
    };

    return (
        <div className="company-dashboard-container">
            <header className="dashboard-header-v2">
                <div><h1>Chào mừng trở lại!</h1><p>Đây là tổng quan hiệu suất kinh doanh của bạn trên hệ thống.</p></div>
                <button onClick={exportReport} className="export-button"><FaDownload /> Xuất báo cáo</button>
            </header>

            <div className="stats-grid-v2">
                <StatCardV2 title="Tổng lượt tiếp cận" data={statData.reach} icon={<FaEye />} color="blue" />
                <StatCardV2 title="Tương tác mới" data={statData.interactions} icon={<FaUsers />} color="green" />
                <StatCardV2 title="Đánh giá trung bình" data={statData.avgRating} icon={<FaStar />} color="yellow" />
                <StatCardV2 title="Tỷ lệ chuyển đổi" data={statData.conversionRate} icon={<FaExchangeAlt />} color="purple" />
            </div>
            
            <div className="dashboard-charts-area">
                {/* Hàng 1 */}
                <div className="dashboard-chart-row">
                    <ComboChart data={adCampaignData} title="Hiệu quả Chiến dịch Quảng cáo" />
                    <DualLineChart data={customerInteractionData} title="Tương tác của Khách hàng (7 ngày qua)" />
                </div>
                {/* Hàng 2 */}
                <div className="dashboard-chart-row">
                    <PieChart data={monthlyRatingDistribution} title="Đánh giá trong tháng" />
                    <FeaturedReviews data={featuredReviewsData} title="Đánh giá tiêu biểu" />
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;