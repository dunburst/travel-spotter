// src/page-staff/Documents.jsx
import React from 'react';
import { FaFolder, FaFilePdf, FaFileWord, FaRegFileAlt } from 'react-icons/fa';

// Dữ liệu mẫu đã được cập nhật với thuộc tính 'url' cho các file
const mockDocuments = [
    { id: 1, type: 'folder', name: "Chính sách Nhân sự", date: "01/08/2025", editor: "Phòng Nhân sự" },
    { id: 2, type: 'folder', name: "Hướng dẫn Kiểm duyệt", date: "25/07/2025", editor: "Trưởng phòng Vận hành" },
    { 
        id: 3, 
        type: 'file', 
        fileType: 'pdf', 
        name: "Nội quy công ty.pdf", 
        date: "15/06/2025", 
        editor: "Phòng Nhân sự",
        // Link tới một file PDF mẫu trên mạng
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
    },
    { 
        id: 4, 
        type: 'file', 
        fileType: 'word', 
        name: "Sơ đồ tổ chức.docx", 
        date: "10/06/2025", 
        editor: "Ban Giám đốc",
        // Link tới một file DOCX mẫu trên mạng
        url: "https://file-examples.com/storage/fe235481fb64f1c97a8b13d/2017/02/file-sample_100kB.docx"
    },
];

const getFileIcon = (fileType) => {
    switch (fileType) {
        case 'folder': return <FaFolder style={{ color: '#f59e0b' }} />;
        case 'pdf': return <FaFilePdf style={{ color: '#ef4444' }} />;
        case 'word': return <FaFileWord style={{ color: '#3b82f6' }} />;
        default: return <FaRegFileAlt />;
    }
};

const Documents = () => {
    // Hàm xử lý khi nhấn vào một thư mục
    const handleFolderClick = (e, folderName) => {
        e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
        
        console.log("Navigate to folder:", folderName);
    };

    return (
        <div className="widget-card">
            <h3 className="widget-title">Tất cả tài liệu</h3>
            <table className="document-table">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Ngày sửa đổi</th>
                        <th>Người sửa đổi</th>
                    </tr>
                </thead>
                <tbody>
                    {mockDocuments.map((doc) => (
                        <tr key={doc.id}>
                            <td className="document-name-cell">
                                {getFileIcon(doc.type === 'folder' ? 'folder' : doc.fileType)}
                                
                                {doc.type === 'file' ? (
                                    // Đối với file, mở link trong tab mới
                                    <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="document-link"
                                    >
                                        {doc.name}
                                    </a>
                                ) : (
                                    // Đối với folder, gọi hàm xử lý
                                    <a 
                                        href="#" 
                                        onClick={(e) => handleFolderClick(e, doc.name)} 
                                        className="document-link"
                                    >
                                        {doc.name}
                                    </a>
                                )}
                            </td>
                            <td>{doc.date}</td>
                            <td>{doc.editor}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Documents;