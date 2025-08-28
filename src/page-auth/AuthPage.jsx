// src/page-auth/AuthPage.jsx
import React, { useState } from "react";
import { login, registerUser, registerCompany } from "../services/api";
import "./AuthPage.css";

// --- Import ảnh từ thư mục assets ---
import userImage from '../assets/images/User.jpg';
import companyImage from '../assets/images/Company.jpg';

// --- Component Footer ---
const Footer = () => (
    <footer className="auth-footer">
        <p>© 2025 TravelSuggest · Giúp bạn tìm đường và khám phá.</p>
        <p>Email hỗ trợ: <a href="mailto:support@example.com">support@example.com</a></p>
    </footer>
);

// --- LoginView ---
const LoginView = ({ onLogin, setView }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await onLogin({ username, password });
        } catch (err) {
            alert(err.message || "Đăng nhập thất bại");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Đi đến nơi bạn muốn</h2>
                <form className="auth-form" onSubmit={handleLogin}>
                    <label>Tên đăng nhập:</label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <label>Mật khẩu:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="auth-btn">Đăng nhập</button>
                </form>
                <p className="auth-link">
                    Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setView('registerChoice'); }}>Đăng ký</a>
                </p>
            </div>
            <Footer />
        </div>
    );
};

// --- RegisterChoiceView ---
const RegisterChoiceView = ({ setView }) => (
    <div className="register-choice-wrapper">
        <div className="dark-overlay"></div>
        <div className="register-choice-container">
            <h2>Bạn muốn đăng ký với vai trò:</h2>
            <div className="register-options">
                <div className="register-card" onClick={() => setView('registerUser')}>
                    <img src={userImage} alt="Người dùng" />
                    <p>Du khách</p>
                </div>
                <div className="register-card" onClick={() => setView('registerCompany')}>
                    <img src={companyImage} alt="Doanh nghiệp" />
                    <p>Doanh nghiệp</p>
                </div>
            </div>
             <p className="auth-link" style={{ marginTop: '2rem', fontSize: '1rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Quay lại đăng nhập</a>
            </p>
        </div>
    </div>
);

// --- UserRegisterView ---
const UserRegisterView = ({ setView }) => {
    const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) return alert("Mật khẩu không khớp");
        try {
            await registerUser(form);
            alert("Đăng ký thành công!");
            setView('login');
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Đăng ký thất bại");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Tạo tài khoản của bạn</h2>
                <form className="auth-form" onSubmit={handleRegister}>
                    <label>Tên đăng nhập:</label>
                    <input name="username" value={form.username} onChange={handleChange} required />
                    <label>Email:</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    <label>Mật khẩu:</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} required />
                    <label>Xác nhận mật khẩu:</label>
                    <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
                    <button type="submit" className="auth-btn">Đăng ký</button>
                </form>
                <p className="auth-link">
                    Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Đăng nhập</a>
                </p>
            </div>
            <Footer />
        </div>
    );
};

// --- CompanyRegisterView ---
const CompanyRegisterView = ({ setView }) => {
    const [form, setForm] = useState({ username: "", companyName: "", taxCode: "", email: "", password: "", confirm: "" });
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) return alert("Mật khẩu không khớp");
        try {
            const response = await registerCompany(form);
            if (response.data.status === "PENDING") {
                alert("Tài khoản đã được tạo và đang chờ phê duyệt.");
            } else {
                alert("Đăng ký thành công!");
            }
            setView('login');
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Đăng ký thất bại");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Tạo tài khoản doanh nghiệp</h2>
                <form className="auth-form" onSubmit={handleRegister}>
                    <label>Tên đăng nhập:</label>
                    <input name="username" value={form.username} onChange={handleChange} required />
                    <label>Tên công ty:</label>
                    <input name="companyName" value={form.companyName} onChange={handleChange} required />
                    <label>Mã số thuế:</label>
                    <input name="taxCode" value={form.taxCode} onChange={handleChange} required />
                    <label>Email:</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    <label>Mật khẩu:</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} required />
                    <label>Xác nhận mật khẩu:</label>
                    <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
                    <button type="submit" className="auth-btn">Đăng ký</button>
                </form>
                <p className="auth-link">
                    Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Đăng nhập</a>
                </p>
            </div>
            <Footer />
        </div>
    );
};

// --- COMPONENT CHÍNH ---
export default function AuthPage({ onLogin }) {
    const [view, setView] = useState('login'); 

    if (view === 'registerChoice') {
        return <RegisterChoiceView setView={setView} />;
    }
    if (view === 'registerUser') {
        return <UserRegisterView setView={setView} />;
    }
    if (view === 'registerCompany') {
        return <CompanyRegisterView setView={setView} />;
    }
    return <LoginView onLogin={onLogin} setView={setView} />;
}
