
CREATE DATABASE PTD_Database;
GO
USE PTD_Database;
GO

-- =====================================================
-- BẢNG: NGƯỜI DÙNG
-- =====================================================
CREATE TABLE NguoiDung (
    id INT IDENTITY(1,1) PRIMARY KEY,
    hoTen NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    matKhau NVARCHAR(255) NOT NULL,
    dienThoai NVARCHAR(20),
    diaChi NVARCHAR(300),
    vaiTro NVARCHAR(20) NOT NULL 
        CHECK (vaiTro IN (N'admin', N'khach')),
    ngayTao DATETIME DEFAULT GETDATE(),
    trangThai BIT DEFAULT 1 
);

INSERT INTO NguoiDung (hoTen, email, matKhau, dienThoai, diaChi, vaiTro)
VALUES
(N'Admin BabyCutie', 'admin@babycutie.com', 'admin123', '0378630848', N'Hà Nội', N'admin'),
(N'Nguyễn Thị Lan', 'lan@gmail.com', '123456', '0902222222', N'TP Hồ Chí Minh', N'khach'),
(N'Trần Văn Minh', 'minh@gmail.com', '123456', '0903333333', N'Đà Nẵng', N'khach');

-- =====================================================
-- BẢNG: DANH MỤC (ĐÃ THÊM: icon, hinhAnh, slug)
-- =====================================================
CREATE TABLE DanhMuc (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tenDanhMuc NVARCHAR(200) NOT NULL,
    moTa NVARCHAR(500),
    danhMucCha_id INT NULL,
    icon NVARCHAR(100) NULL,            
    hinhAnh NVARCHAR(255) NULL,          
    slug NVARCHAR(200) NULL,              

    CONSTRAINT FK_DanhMuc_Cha
        FOREIGN KEY (danhMucCha_id) REFERENCES DanhMuc(id)
);

INSERT INTO DanhMuc (tenDanhMuc, moTa, danhMucCha_id, icon, hinhAnh, slug)
VALUES
(N'Cháo dinh dưỡng', N'Tất cả các loại cháo cho bé', NULL, N'🍲', 'danhmuc_chao.jpg', 'chao-dinh-duong'),
(N'Cháo 6–12 tháng', N'Cháo cho bé ăn dặm', 1, N'👶', 'danhmuc_6-12thang.jpg', 'chao-6-12-thang'),
(N'Cháo 1–3 tuổi', N'Cháo cho bé lớn', 1, N'🧒', 'danhmuc_1-3tuoi.jpg', 'chao-1-3-tuoi');

-- =====================================================
-- BẢNG: SẢN PHẨM (ĐÃ THÊM SIZE)
-- =====================================================
CREATE TABLE SanPham (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tenSanPham NVARCHAR(200) NOT NULL,
    moTa NVARCHAR(MAX),
    gia DECIMAL(12,0) NOT NULL,
    hinhAnh NVARCHAR(255),
    doTuoi NVARCHAR(50), 
    protein FLOAT,
    carb FLOAT,
    chatBeo FLOAT,
    danhMuc_id INT NOT NULL,
    ngayTao DATETIME DEFAULT GETDATE(),
    trangThai BIT DEFAULT 1,
    giaVua DECIMAL(12,0) NULL,  
    giaLon DECIMAL(12,0) NULL, 
    giaDai DECIMAL(12,0) NULL,  

    CONSTRAINT FK_SanPham_DanhMuc
        FOREIGN KEY (danhMuc_id) REFERENCES DanhMuc(id)
);

INSERT INTO SanPham
(tenSanPham, moTa, gia, hinhAnh, doTuoi, protein, carb, chatBeo, danhMuc_id, giaVua, giaLon, giaDai)
VALUES
(N'Cháo Cá Hồi Bí Đỏ', N'Omega 3 tốt cho não', 45000, 'cahoibido.jpg', N'6–12 tháng', 18, 35, 12, 2, 45000, 55000, 65000),
(N'Cháo Gà Cà Rốt', N'Tăng đề kháng', 40000, 'gacarot.jpg', N'6–12 tháng', 16, 30, 10, 2, 40000, 50000, 60000),
(N'Cháo Bò Rau Ngót', N'Giàu sắt', 50000, 'thitboraungot.jpg', N'1–3 tuổi', 20, 32, 11, 3, 50000, 60000, 70000),
(N'Cháo Tôm Hạt Sen', N'Giàu canxi, tốt cho trí não và giấc ngủ', 48000, 'tomhatsen.jpg', N'6–12 tháng', 17, 28, 9, 2, 48000, 58000, 68000),
(N'Cháo Cá Lóc Rau Mồng Tơi', N'Dễ tiêu hóa, mát, tốt cho hệ tiêu hóa', 42000, 'calocmongtoi.jpg', N'6–12 tháng', 16, 30, 8, 2, 42000, 52000, 62000),
(N'Cháo Thịt Heo Bí Xanh', N'Bổ sung đạm, giúp bé tăng cân đều', 40000, 'heobixanh.jpg', N'6–12 tháng', 15, 32, 9, 2, 40000, 50000, 60000),
(N'Cháo Lươn Khoai Môn', N'Giàu sắt và vitamin B, giúp bé cứng cáp', 55000, 'luonkhoaimon.jpg', N'1–3 tuổi', 21, 34, 12, 3, 55000, 65000, 75000),
(N'Cháo Sườn Non Cà Rốt', N'Giàu canxi, hỗ trợ phát triển xương', 52000, 'suonnoncarot.jpg', N'1–3 tuổi', 22, 36, 13, 3, 52000, 62000, 72000),
(N'Cháo Gà Ác Hạt Sen', N'Tăng sức đề kháng, giúp bé ngủ ngon', 60000, 'gaachatsen.jpg', N'1–3 tuổi', 23, 30, 11, 3, 60000, 70000, 80000),
(N'Cháo Cá Thu Rau Củ', N'Giàu omega 3, tốt cho trí não và thị lực', 58000, 'cathuraucu.jpg', N'1–3 tuổi', 22, 33, 14, 3, 58000, 68000, 78000);

-- =====================================================
-- BẢNG: GIỎ HÀNG (ĐÃ THÊM SIZE)
-- =====================================================
CREATE TABLE GioHang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nguoiDung_id INT NOT NULL,
    sanPham_id INT NOT NULL,
    soLuong INT NOT NULL CHECK (soLuong > 0),
    size NVARCHAR(20) NULL DEFAULT N'vua', 
    CONSTRAINT FK_GioHang_NguoiDung
        FOREIGN KEY (nguoiDung_id) REFERENCES NguoiDung(id)
        ON DELETE CASCADE,
    CONSTRAINT FK_GioHang_SanPham
        FOREIGN KEY (sanPham_id) REFERENCES SanPham(id)
        ON DELETE CASCADE
);

INSERT INTO GioHang (nguoiDung_id, sanPham_id, soLuong, size)
VALUES
(2, 1, 2, N'vua'),
(2, 2, 1, N'lon'),
(3, 3, 1, N'vua');

-- =====================================================
-- BẢNG: ĐƠN HÀNG (ĐÃ THÊM: thoiGianNhanHang, trangThaiNhanHang)
-- =====================================================
CREATE TABLE DonHang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nguoiDung_id INT NOT NULL,
    tongTien DECIMAL(12,0) NOT NULL,
    trangThai NVARCHAR(50) DEFAULT N'Chờ xác nhận',
    ngayDat DATETIME DEFAULT GETDATE(),
    diaChiGiaoHang NVARCHAR(300),
    thoiGianNhanHang DATETIME NULL,        
    trangThaiNhanHang NVARCHAR(50) DEFAULT N'Chưa nhận',
    CONSTRAINT FK_DonHang_NguoiDung
        FOREIGN KEY (nguoiDung_id) REFERENCES NguoiDung(id)
);

INSERT INTO DonHang (nguoiDung_id, tongTien, diaChiGiaoHang, thoiGianNhanHang, trangThaiNhanHang)
VALUES
(2, 130000, N'12 Nguyễn Trãi, Q1, TP.HCM', DATEADD(HOUR, 2, GETDATE()), N'Đang giao'),
(3, 50000, N'45 Lê Duẩn, Đà Nẵng', DATEADD(HOUR, 3, GETDATE()), N'Chưa nhận');

-- =====================================================
-- BẢNG: CHI TIẾT ĐƠN HÀNG (ĐÃ THÊM SIZE)
-- =====================================================
CREATE TABLE ChiTietDonHang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    donHang_id INT NOT NULL,
    sanPham_id INT NOT NULL,
    soLuong INT NOT NULL,
    gia DECIMAL(12,0) NOT NULL,
    size NVARCHAR(20) NULL DEFAULT N'vua',  
    CONSTRAINT FK_CTDH_DonHang
        FOREIGN KEY (donHang_id) REFERENCES DonHang(id)
        ON DELETE CASCADE,
    CONSTRAINT FK_CTDH_SanPham
        FOREIGN KEY (sanPham_id) REFERENCES SanPham(id)
);

INSERT INTO ChiTietDonHang (donHang_id, sanPham_id, soLuong, gia, size)
VALUES
(1, 1, 2, 45000, N'vua'),
(1, 2, 1, 40000, N'vua'),
(2, 3, 1, 50000, N'vua');

-- =====================================================
-- BẢNG: THANH TOÁN (ĐÃ THÊM: soPhieuThu, filePhieuThu)
-- =====================================================
CREATE TABLE ThanhToan (
    id INT IDENTITY(1,1) PRIMARY KEY,
    donHang_id INT NOT NULL,
    phuongThuc NVARCHAR(50),
    trangThai NVARCHAR(50),
    ngayThanhToan DATETIME DEFAULT GETDATE(),
     soPhieuThu NVARCHAR(50) NULL,      
    filePhieuThu NVARCHAR(255) NULL,       
	    CONSTRAINT FK_ThanhToan_DonHang
        FOREIGN KEY (donHang_id) REFERENCES DonHang(id)
        ON DELETE CASCADE
);

INSERT INTO ThanhToan (donHang_id, phuongThuc, trangThai, soPhieuThu, filePhieuThu)
VALUES
(1, N'COD', N'Đã thanh toán', 'PT001', NULL),
(2, N'Chuyển khoản', N'Đã thanh toán', 'PT002', 'phieuthu_002.pdf');

-- =====================================================
-- BẢNG: TIN TỨC (ĐÃ THÊM: tomTat, luotXem, trangThai)
-- =====================================================
CREATE TABLE TinTuc (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tieuDe NVARCHAR(300) NOT NULL,
    noiDung NVARCHAR(MAX),
    hinhAnh NVARCHAR(255),
    nguoiDung_id INT,
    ngayDang DATETIME DEFAULT GETDATE(),
    tomTat NVARCHAR(500) NULL,             
    luotXem INT DEFAULT 0,                 
    trangThai BIT DEFAULT 1,              
	    CONSTRAINT FK_TinTuc_NguoiDung
        FOREIGN KEY (nguoiDung_id) REFERENCES NguoiDung(id)
);

INSERT INTO TinTuc (tieuDe, noiDung, hinhAnh, nguoiDung_id, tomTat, luotXem, trangThai)
VALUES
(
    N'Lợi ích của cháo cá hồi đối với sự phát triển trí não của bé',
    N'Cháo cá hồi là món ăn giàu Omega 3, DHA và EPA giúp hỗ trợ phát triển trí não, tăng cường trí nhớ và khả năng tập trung cho trẻ nhỏ. 
    Ngoài ra, cá hồi còn chứa nhiều protein chất lượng cao giúp bé phát triển cơ bắp và tăng cường sức đề kháng. 
    Mẹ nên cho bé ăn cháo cá hồi 2–3 bữa mỗi tuần để đạt hiệu quả tốt nhất.',
    'tintuc_cahoi.jpg',
    1,
    N'Cháo cá hồi giàu Omega 3, DHA và EPA giúp phát triển trí não và tăng cường sức đề kháng cho bé.',
    156,
    1
),
(
    N'Khi nào nên cho bé bắt đầu ăn dặm?',
    N'Theo khuyến cáo của các chuyên gia dinh dưỡng, thời điểm lý tưởng để bé bắt đầu ăn dặm là từ 6 tháng tuổi. 
    Giai đoạn này, hệ tiêu hóa của bé đã dần hoàn thiện và có thể làm quen với các loại thực phẩm ngoài sữa mẹ. 
    Mẹ nên bắt đầu với cháo loãng, dễ tiêu và tăng dần độ đặc theo thời gian.',
    'tintuc_andam.jpg',
    1,
    N'Thời điểm lý tưởng cho bé bắt đầu ăn dặm là từ 6 tháng tuổi với cháo loãng và dễ tiêu.',
    234,
    1
),
(
    N'Thực đơn cháo dinh dưỡng giúp bé tăng cân đều',
    N'Một thực đơn cháo dinh dưỡng hợp lý cần đảm bảo đủ 4 nhóm chất: tinh bột, đạm, chất béo và vitamin – khoáng chất. 
    Các món cháo như cháo gà ác, cháo bò rau ngót, cháo tôm hạt sen không chỉ giàu dinh dưỡng mà còn giúp bé ăn ngon miệng hơn. 
    Việc thay đổi thực đơn thường xuyên sẽ giúp bé không bị ngán.',
    'tintuc_thucdon.jpg',
    1,
    N'Thực đơn cháo dinh dưỡng cần đảm bảo đủ 4 nhóm chất để giúp bé tăng cân đều và phát triển khỏe mạnh.',
    189,
    1
),
(
    N'Lưu ý quan trọng khi bảo quản cháo dinh dưỡng cho bé',
    N'Cháo dinh dưỡng sau khi nấu nên được bảo quản trong ngăn mát tủ lạnh và sử dụng trong vòng 24 giờ để đảm bảo an toàn thực phẩm. 
    Khi hâm nóng, mẹ cần khuấy đều và kiểm tra nhiệt độ trước khi cho bé ăn. 
    Không nên hâm cháo nhiều lần vì có thể làm mất chất dinh dưỡng.',
    'tintuc_baoquan.jpg',
    1,
    N'Cháo dinh dưỡng nên bảo quản trong ngăn mát tủ lạnh và sử dụng trong vòng 24 giờ để đảm bảo an toàn.',
    145,
    1
);

-- =====================================================
-- BẢNG: LIÊN HỆ (ĐÃ THÊM: dienThoai, trangThai)
-- =====================================================
CREATE TABLE LienHe (
    id INT IDENTITY(1,1) PRIMARY KEY,
    hoTen NVARCHAR(150),
    email NVARCHAR(150),
    noiDung NVARCHAR(500),
    ngayGui DATETIME DEFAULT GETDATE(),
      dienThoai NVARCHAR(20) NULL,           
    trangThai NVARCHAR(50) DEFAULT N'Chưa xử lý' 
);

INSERT INTO LienHe (hoTen, email, noiDung, dienThoai, trangThai)
VALUES
(
    N'Phạm Thị Hương',
    'huongpham@gmail.com',
    N'Shop cho mình hỏi bé 7 tháng thì nên dùng loại cháo nào là phù hợp nhất ạ?',
    '0912345678',
    N'Đã xử lý'
),
(
    N'Nguyễn Văn Long',
    'longnguyen@gmail.com',
    N'Mình muốn đặt cháo giao định kỳ trong tuần thì shop có hỗ trợ không?',
    '0923456789',
    N'Đang xử lý'
),
(
    N'Lê Thị Mai',
    'lemai@gmail.com',
    N'Shop có giao hàng buổi tối sau 18h không? Mình đi làm về muộn.',
    '0934567890',
    N'Chưa xử lý'
),
(
    N'Trần Quốc Bảo',
    'baotran@gmail.com',
    N'Mình muốn tư vấn thực đơn cháo giúp bé tăng cân đều, shop hỗ trợ giúp mình nhé.',
    '0945678901',
    N'Chưa xử lý'
),
(
    N'Nguyễn Thị Thu',
    'thuthu@gmail.com',
    N'Mình đặt đơn hôm qua nhưng chưa thấy xác nhận, nhờ shop kiểm tra giúp mình.',
    '0956789012',
    N'Đã xử lý'
);

-- =====================================================
-- BẢNG: KHUYẾN MÃI
-- =====================================================
CREATE TABLE KhuyenMai (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tenKhuyenMai NVARCHAR(200) NOT NULL,
    maKhuyenMai NVARCHAR(50) NOT NULL UNIQUE,
    loaiGiamGia NVARCHAR(20) NOT NULL 
        CHECK (loaiGiamGia IN (N'phan_tram', N'tien_mat')),
    giaTriGiam DECIMAL(12,0) NOT NULL,
    giaTriToiDa DECIMAL(12,0),      
    donHangToiThieu DECIMAL(12,0),  
    ngayBatDau DATETIME,
    ngayKetThuc DATETIME,
    trangThai BIT DEFAULT 1,       
    ngayTao DATETIME DEFAULT GETDATE()
);

INSERT INTO KhuyenMai
(tenKhuyenMai, maKhuyenMai, loaiGiamGia, giaTriGiam,
 giaTriToiDa, donHangToiThieu, ngayBatDau, ngayKetThuc)
VALUES
(
    N'Giảm 10% cho khách hàng mới',
    'WELCOME10',
    N'phan_tram',
    10,
    30000,
    100000,
    '2025-01-01',
    '2025-12-31'
),
(
    N'Giảm 20.000đ cho đơn từ 80.000đ',
    'SALE20K',
    N'tien_mat',
    20000,
    NULL,
    80000,
    '2025-01-01',
    '2025-06-30'
),
(
    N'Ưu đãi cuối tuần giảm 15%',
    'WEEKEND15',
    N'phan_tram',
    15,
    50000,
    150000,
    '2025-03-01',
    '2025-12-31'
),
(
    N'Giảm 30.000đ cho đơn lớn',
    'BIGORDER30',
    N'tien_mat',
    30000,
    NULL,
    200000,
    '2025-01-01',
    '2025-12-31'
),
(
    N'Khuyến mại sinh nhật bé',
    'BIRTHDAY20',
    N'phan_tram',
    20,
    60000,
    120000,
    '2025-01-01',
    '2025-12-31'
);

-- =====================================================
-- BẢNG: ĐƠN HÀNG - KHUYẾN MÃI
-- =====================================================
CREATE TABLE DonHang_KhuyenMai (
    donHang_id INT NOT NULL,
    khuyenMai_id INT NOT NULL,
    soTienGiam DECIMAL(12,0) NOT NULL,

    PRIMARY KEY (donHang_id, khuyenMai_id),

    CONSTRAINT FK_DHKM_DonHang
        FOREIGN KEY (donHang_id) REFERENCES DonHang(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_DHKM_KhuyenMai
        FOREIGN KEY (khuyenMai_id) REFERENCES KhuyenMai(id)
        ON DELETE CASCADE
);

INSERT INTO DonHang_KhuyenMai (donHang_id, khuyenMai_id, soTienGiam)
VALUES
(1, 1, 30000),
(2, 2, 20000);

-- =====================================================
-- BẢNG: ĐÁNH GIÁ SẢN PHẨM
-- =====================================================
CREATE TABLE DanhGia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nguoiDung_id INT NOT NULL,
    sanPham_id INT NOT NULL,
    soSao INT NOT NULL 
        CHECK (soSao BETWEEN 1 AND 5),
    noiDung NVARCHAR(500),
    ngayDanhGia DATETIME DEFAULT GETDATE(),

    CONSTRAINT UQ_DanhGia UNIQUE (nguoiDung_id, sanPham_id),

    CONSTRAINT FK_DanhGia_NguoiDung
        FOREIGN KEY (nguoiDung_id) REFERENCES NguoiDung(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_DanhGia_SanPham
        FOREIGN KEY (sanPham_id) REFERENCES SanPham(id)
        ON DELETE CASCADE
);

INSERT INTO DanhGia (nguoiDung_id, sanPham_id, soSao, noiDung)
VALUES
(2, 1, 5, N'Cháo rất ngon'),
(2, 2, 4, N'Bé ăn hợp'),
(3, 3, 5, N'Rất chất lượng');

-- =====================================================
-- KIỂM TRA DỮ LIỆU
-- =====================================================
PRINT '=== KIỂM TRA DỮ LIỆU ===';
SELECT 'NguoiDung' AS TableName, COUNT(*) AS RecordCount FROM NguoiDung
UNION ALL
SELECT 'DanhMuc', COUNT(*) FROM DanhMuc
UNION ALL
SELECT 'SanPham', COUNT(*) FROM SanPham
UNION ALL
SELECT 'GioHang', COUNT(*) FROM GioHang
UNION ALL
SELECT 'DonHang', COUNT(*) FROM DonHang
UNION ALL
SELECT 'ChiTietDonHang', COUNT(*) FROM ChiTietDonHang
UNION ALL
SELECT 'ThanhToan', COUNT(*) FROM ThanhToan
UNION ALL
SELECT 'TinTuc', COUNT(*) FROM TinTuc
UNION ALL
SELECT 'LienHe', COUNT(*) FROM LienHe
UNION ALL
SELECT 'KhuyenMai', COUNT(*) FROM KhuyenMai
UNION ALL
SELECT 'DonHang_KhuyenMai', COUNT(*) FROM DonHang_KhuyenMai
UNION ALL
SELECT 'DanhGia', COUNT(*) FROM DanhGia;

-- Kiểm tra các thuộc tính mới
PRINT '';
PRINT '=== KIỂM TRA CÁC THUỘC TÍNH MỚI ===';

-- DanhMuc
PRINT 'DanhMuc - Các cột mới:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'DanhMuc' 
    AND COLUMN_NAME IN ('icon', 'hinhAnh', 'slug');

-- DonHang
PRINT 'DonHang - Các cột mới:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'DonHang' 
    AND COLUMN_NAME IN ('thoiGianNhanHang', 'trangThaiNhanHang');

-- ThanhToan
PRINT 'ThanhToan - Các cột mới:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ThanhToan' 
    AND COLUMN_NAME IN ('soPhieuThu', 'filePhieuThu');

-- TinTuc
PRINT 'TinTuc - Các cột mới:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TinTuc' 
    AND COLUMN_NAME IN ('tomTat', 'luotXem', 'trangThai');

-- LienHe
PRINT 'LienHe - Các cột mới:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'LienHe' 
    AND COLUMN_NAME IN ('dienThoai', 'trangThai');


