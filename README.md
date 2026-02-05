
HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG
1.	Tài khoản đăng nhập hệ thống
Hệ thống được thiết kế theo mô hình phân quyền người dùng nhằm đảm bảo tính bảo mật và thuận tiện trong quá trình vận hành.
STT	Vai trò	Tài khoản	Mật khẩu	Chức năng
1	Quản trị viên	admin@babycutie.com	Admin123	Quản lý toàn bộ hệ thống
2	Khách hàng	khachhang@gmail.com	123456	Thực hiện các chức năng của khách hàng
2.	Hướng dẫn cài đặt hệ thống
2.1.	Yêu cầu môi trường
Hệ thống cần cài đặt các phần mềm sau:
•	Python 3.10 trở lên
•	SQL Server (Express/Developer)
•	ODBC Driver 17 hoặc 18 for SQL Server
•	Trình duyệt Chrome/Edge/Firefox
2.2.	Giải nén mã nguồn
Giải nén file: https://github.com/phamthanhdat-hub/K22CNT3-2210900007-PhamThanhDat-DATN
2.3.	Cài đặt cơ sở dữ liệu
Hệ thống sử dụng SQL Server và kết nối trực tiếp thông qua thư viện pyodbc, không sử dụng file cấu hình trung gian.
Thực hiện các bước sau:
Bước 1: Mở SQL Server Management Studio (SSMS).
Bước 2: Tạo database mới tên: PTD_Database.
Bước 3: Mở file models.sql và Execute để tạo bảng dữ liệu.
Bước 4: Kiểm tra thông tin kết nối trực tiếp trong file app.py:
conn = pyodbc.connect(
            "DRIVER={SQL Server};"
            "SERVER=DESKTOP-HD2ANFT\\MSSQLSERVER03;"
            "DATABASE=PTD_Database;"
            "Trusted_Connection=yes;"
        )
Lưu ý: Người dùng có thể thay đổi server hoặc database theo máy tính đang sử dụng.
2.4.	Cài đặt thư viện Python
Mở Command Prompt tại thư mục project và chạy:
pip install -r requirements.txt
2.5.	Khởi chạy hệ thống
Chạy lệnh: python app.py
Sau khi chạy thành công, hệ thống hoạt động tại trình duyệt: http://127.0.0.1:5000
2.6.	Truy cập các trang chức năng
•	Trang quản trị: http://localhost:5000/ frontend/admin-dashboard.html
•	Trang khách hàng: http://127.0.0.1:5000/ frontend/index.html
