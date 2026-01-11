CREATE DATABASE PTD_DB;
GO
USE PTD_DB;
GO
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
    trangThai BIT DEFAULT 1 -- 1: hoạt động, 0: khóa
);
INSERT INTO NguoiDung (hoTen, email, matKhau, dienThoai, diaChi, vaiTro)
VALUES
(N'Admin BabyCutie', 'admin@babycutie.com', 'admin123', '0378630848', N'Hà Nội', N'admin'),
(N'Nguyễn Thị Lan', 'lan@gmail.com', '123456', '0902222222', N'TP Hồ Chí Minh', N'khach'),
(N'Trần Văn Minh', 'minh@gmail.com', '123456', '0903333333', N'Đà Nẵng', N'khach');

CREATE TABLE DanhMuc (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tenDanhMuc NVARCHAR(200) NOT NULL,
    moTa NVARCHAR(500),
    danhMucCha_id INT NULL,

    CONSTRAINT FK_DanhMuc_Cha
        FOREIGN KEY (danhMucCha_id) REFERENCES DanhMuc(id)
);
INSERT INTO DanhMuc (tenDanhMuc, moTa, danhMucCha_id)
VALUES
(N'Cháo dinh dưỡng', N'Tất cả các loại cháo cho bé', NULL),
(N'Cháo 6–12 tháng', N'Cháo cho bé ăn dặm', 1),
(N'Cháo 1–3 tuổi', N'Cháo cho bé lớn', 1);


CREATE TABLE SanPham (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tenSanPham NVARCHAR(200) NOT NULL,
    moTa NVARCHAR(MAX),
    gia DECIMAL(12,0) NOT NULL,
    hinhAnh NVARCHAR(255),
    doTuoi NVARCHAR(50), -- 6-12 tháng, 1-3 tuổi
    protein FLOAT,
    carb FLOAT,
    chatBeo FLOAT,
    danhMuc_id INT NOT NULL,
    ngayTao DATETIME DEFAULT GETDATE(),
    trangThai BIT DEFAULT 1,

    CONSTRAINT FK_SanPham_DanhMuc
        FOREIGN KEY (danhMuc_id) REFERENCES DanhMuc(id)
);
INSERT INTO SanPham
(tenSanPham, moTa, gia, hinhAnh, doTuoi, protein, carb, chatBeo, danhMuc_id)
VALUES
(N'Cháo Cá Hồi Bí Đỏ', N'Omega 3 tốt cho não', 45000, 'cahoibido.jpg', N'6–12 tháng', 18, 35, 12, 2),
(N'Cháo Gà Cà Rốt', N'Tăng đề kháng', 40000, 'gacarot.jpg', N'6–12 tháng', 16, 30, 10, 2),
(N'Cháo Bò Rau Ngót', N'Giàu sắt', 50000, 'thitboraungot.jpg', N'1–3 tuổi', 20, 32, 11, 3),
(N'Cháo Tôm Hạt Sen', N'Giàu canxi, tốt cho trí não và giấc ngủ', 48000, 'tomhatsen.jpg', N'6–12 tháng', 17, 28, 9, 2),
(N'Cháo Cá Lóc Rau Mồng Tơi', N'Dễ tiêu hóa, mát, tốt cho hệ tiêu hóa', 42000, 'calocmongtoi.jpg', N'6–12 tháng', 16, 30, 8, 2),
(N'Cháo Thịt Heo Bí Xanh', N'Bổ sung đạm, giúp bé tăng cân đều', 40000, 'heobixanh.jpg', N'6–12 tháng', 15, 32, 9, 2),
(N'Cháo Lươn Khoai Môn', N'Giàu sắt và vitamin B, giúp bé cứng cáp', 55000, 'luonkhoaimon.jpg', N'1–3 tuổi', 21, 34, 12, 3),
(N'Cháo Sườn Non Cà Rốt', N'Giàu canxi, hỗ trợ phát triển xương', 52000, 'suonnoncarot.jpg', N'1–3 tuổi', 22, 36, 13, 3),
(N'Cháo Gà Ác Hạt Sen', N'Tăng sức đề kháng, giúp bé ngủ ngon', 60000, 'gaachatsen.jpg', N'1–3 tuổi', 23, 30, 11, 3),
(N'Cháo Cá Thu Rau Củ', N'Giàu omega 3, tốt cho trí não và thị lực', 58000, 'cathuraucu.jpg', N'1–3 tuổi', 22, 33, 14, 3);


CREATE TABLE GioHang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nguoiDung_id INT NOT NULL,
    sanPham_id INT NOT NULL,
    soLuong INT NOT NULL CHECK (soLuong > 0),

    CONSTRAINT FK_GioHang_NguoiDung
        FOREIGN KEY (nguoiDung_id) REFERENCES NguoiDung(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_GioHang_SanPham
        FOREIGN KEY (sanPham_id) REFERENCES SanPham(id)
        ON DELETE CASCADE
);
INSERT INTO GioHang (nguoiDung_id, sanPham_id, soLuong)
VALUES
(2, 1, 2),
(2, 2, 1),
(3, 3, 1);


CREATE TABLE DonHang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nguoiDung_id INT NOT NULL,
    tongTien DECIMAL(12,0) NOT NULL,
    trangThai NVARCHAR(50) DEFAULT N'Chờ xác nhận',
    ngayDat DATETIME DEFAULT GETDATE(),
    diaChiGiaoHang NVARCHAR(300),

    CONSTRAINT FK_DonHang_NguoiDung
        FOREIGN KEY (nguoiDung_id) REFERENCES NguoiDung(id)
);
INSERT INTO DonHang (nguoiDung_id, tongTien, diaChiGiaoHang)
VALUES
(2, 130000, N'12 Nguyễn Trãi, Q1, TP.HCM'),
(3, 50000, N'45 Lê Duẩn, Đà Nẵng');

CREATE TABLE ChiTietDonHang (
    id INT IDENTITY(1,1) PRIMARY KEY,
    donHang_id INT NOT NULL,
    sanPham_id INT NOT NULL,
    soLuong INT NOT NULL,
    gia DECIMAL(12,0) NOT NULL,

    CONSTRAINT FK_CTDH_DonHang
        FOREIGN KEY (donHang_id) REFERENCES DonHang(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_CTDH_SanPham
        FOREIGN KEY (sanPham_id) REFERENCES SanPham(id)
);
INSERT INTO ChiTietDonHang (donHang_id, sanPham_id, soLuong, gia)
VALUES
(1, 1, 2, 45000),
(1, 2, 1, 40000),
(2, 3, 1, 50000);

CREATE TABLE ThanhToan (
    id INT IDENTITY(1,1) PRIMARY KEY,
    donHang_id INT NOT NULL,
    phuongThuc NVARCHAR(50), -- COD, Chuyển khoản
    trangThai NVARCHAR(50),
    ngayThanhToan DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_ThanhToan_DonHang
        FOREIGN KEY (donHang_id) REFERENCES DonHang(id)
        ON DELETE CASCADE
);
INSERT INTO ThanhToan (donHang_id, phuongThuc, trangThai)
VALUES
(1, N'COD', N'Đã thanh toán'),
(2, N'Chuyển khoản', N'Đã thanh toán');

CREATE TABLE TinTuc (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tieuDe NVARCHAR(300) NOT NULL,
    noiDung NVARCHAR(MAX),
    hinhAnh NVARCHAR(255),
    nguoiDung_id INT,
    ngayDang DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_TinTuc_NguoiDung
        FOREIGN KEY (nguoiDung_id) REFERENCES NguoiDung(id)
);
INSERT INTO TinTuc (tieuDe, noiDung, hinhAnh, nguoiDung_id)
VALUES
(
    N'Lợi ích của cháo cá hồi đối với sự phát triển trí não của bé',
    N'Cháo cá hồi là món ăn giàu Omega 3, DHA và EPA giúp hỗ trợ phát triển trí não, tăng cường trí nhớ và khả năng tập trung cho trẻ nhỏ. 
    Ngoài ra, cá hồi còn chứa nhiều protein chất lượng cao giúp bé phát triển cơ bắp và tăng cường sức đề kháng. 
    Mẹ nên cho bé ăn cháo cá hồi 2–3 bữa mỗi tuần để đạt hiệu quả tốt nhất.',
    'tintuc_cahoi.jpg',
    1
),
(
    N'Khi nào nên cho bé bắt đầu ăn dặm?',
    N'Theo khuyến cáo của các chuyên gia dinh dưỡng, thời điểm lý tưởng để bé bắt đầu ăn dặm là từ 6 tháng tuổi. 
    Giai đoạn này, hệ tiêu hóa của bé đã dần hoàn thiện và có thể làm quen với các loại thực phẩm ngoài sữa mẹ. 
    Mẹ nên bắt đầu với cháo loãng, dễ tiêu và tăng dần độ đặc theo thời gian.',
    'tintuc_andam.jpg',
    1
),
(
    N'Thực đơn cháo dinh dưỡng giúp bé tăng cân đều',
    N'Một thực đơn cháo dinh dưỡng hợp lý cần đảm bảo đủ 4 nhóm chất: tinh bột, đạm, chất béo và vitamin – khoáng chất. 
    Các món cháo như cháo gà ác, cháo bò rau ngót, cháo tôm hạt sen không chỉ giàu dinh dưỡng mà còn giúp bé ăn ngon miệng hơn. 
    Việc thay đổi thực đơn thường xuyên sẽ giúp bé không bị ngán.',
    'tintuc_thucdon.jpg',
    1
),
(
    N'Lưu ý quan trọng khi bảo quản cháo dinh dưỡng cho bé',
    N'Cháo dinh dưỡng sau khi nấu nên được bảo quản trong ngăn mát tủ lạnh và sử dụng trong vòng 24 giờ để đảm bảo an toàn thực phẩm. 
    Khi hâm nóng, mẹ cần khuấy đều và kiểm tra nhiệt độ trước khi cho bé ăn. 
    Không nên hâm cháo nhiều lần vì có thể làm mất chất dinh dưỡng.',
    'tintuc_baoquan.jpg',
    1
);
delete TinTuc

CREATE TABLE LienHe (
    id INT IDENTITY(1,1) PRIMARY KEY,
    hoTen NVARCHAR(150),
    email NVARCHAR(150),
    noiDung NVARCHAR(500),
    ngayGui DATETIME DEFAULT GETDATE()
);
INSERT INTO LienHe (hoTen, email, noiDung)
VALUES
(
    N'Phạm Thị Hương',
    'huongpham@gmail.com',
    N'Shop cho mình hỏi bé 7 tháng thì nên dùng loại cháo nào là phù hợp nhất ạ?'
),
(
    N'Nguyễn Văn Long',
    'longnguyen@gmail.com',
    N'Mình muốn đặt cháo giao định kỳ trong tuần thì shop có hỗ trợ không?'
),
(
    N'Lê Thị Mai',
    'lemai@gmail.com',
    N'Shop có giao hàng buổi tối sau 18h không? Mình đi làm về muộn.'
),
(
    N'Trần Quốc Bảo',
    'baotran@gmail.com',
    N'Mình muốn tư vấn thực đơn cháo giúp bé tăng cân đều, shop hỗ trợ giúp mình nhé.'
),
(
    N'Nguyễn Thị Thu',
    'thuthu@gmail.com',
    N'Mình đặt đơn hôm qua nhưng chưa thấy xác nhận, nhờ shop kiểm tra giúp mình.'
);

delete LienHe
CREATE TABLE KhuyenMai (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tenKhuyenMai NVARCHAR(200) NOT NULL,
    maKhuyenMai NVARCHAR(50) NOT NULL UNIQUE,
    loaiGiamGia NVARCHAR(20) NOT NULL 
        CHECK (loaiGiamGia IN (N'phan_tram', N'tien_mat')),
    giaTriGiam DECIMAL(12,0) NOT NULL,
    giaTriToiDa DECIMAL(12,0),      -- giới hạn giảm tối đa (nếu có)
    donHangToiThieu DECIMAL(12,0),  -- đơn hàng tối thiểu
    ngayBatDau DATETIME,
    ngayKetThuc DATETIME,
    trangThai BIT DEFAULT 1,        -- 1: hoạt động
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
select * from KhuyenMai
 delete KhuyenMai
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

/* =========================================
   BẢNG: ĐÁNH GIÁ SẢN PHẨM
   ========================================= */
CREATE TABLE DanhGia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nguoiDung_id INT NOT NULL,
    sanPham_id INT NOT NULL,
    soSao INT NOT NULL 
        CHECK (soSao BETWEEN 1 AND 5),
    noiDung NVARCHAR(500),
    ngayDanhGia DATETIME DEFAULT GETDATE(),

    -- 1 người chỉ được đánh giá 1 sản phẩm 1 lần
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
(2, 11, 5, N'Cháo rất ngon'),
(2, 12, 4, N'Bé ăn hợp'),
(3, 13, 5, N'Rất chất lượng');
select * from DanhGia
delete DanhGia


INSERT INTO DonHang_KhuyenMai (donHang_id, khuyenMai_id, soTienGiam)
VALUES
(1, 1, 30000),
(2, 2, 20000);


DELETE FROM GioHang;
DELETE FROM ChiTietDonHang;
DELETE FROM DonHang_KhuyenMai;
DELETE FROM DonHang;
DELETE FROM ThanhToan;
DELETE FROM SanPham


SELECT * FROM NguoiDung;
SELECT * FROM DanhMuc;
SELECT * FROM SanPham;
SELECT * FROM GioHang
SELECT * FROM DonHang;
SELECT * FROM ChiTietDonHang;
SELECT * FROM ThanhToan;
SELECT * FROM TinTuc;
SELECT * FROM LienHe;
SELECT * FROM KhuyenMai;
SELECT * FROM DonHang_KhuyenMai;
drop table SanPham
drop table DanhMuc
drop table GioHang
drop table DonHang
drop table ChiTietDonHang
drop table ThanhToan
drop table TinTuc
drop table LienHe
drop table KhuyenMai
drop table DonHang_KhuyenMai