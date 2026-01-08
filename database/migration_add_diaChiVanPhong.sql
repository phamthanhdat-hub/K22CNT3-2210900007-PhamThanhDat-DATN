-- Migration: Thêm trường diaChiVanPhong vào bảng NguoiDung
-- Chạy script này để thêm trường địa chỉ văn phòng vào database

USE PTD_DB;
GO

-- Kiểm tra xem cột đã tồn tại chưa
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'NguoiDung' AND COLUMN_NAME = 'diaChiVanPhong'
)
BEGIN
    -- Thêm cột diaChiVanPhong
    ALTER TABLE NguoiDung
    ADD diaChiVanPhong NVARCHAR(300) NULL;
    
    PRINT 'Đã thêm cột diaChiVanPhong vào bảng NguoiDung';
END
ELSE
BEGIN
    PRINT 'Cột diaChiVanPhong đã tồn tại';
END
GO

