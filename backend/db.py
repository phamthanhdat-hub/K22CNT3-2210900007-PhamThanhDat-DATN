import pyodbc

def get_db():
    try:
        conn = pyodbc.connect(
            "DRIVER={SQL Server};"
            "SERVER=DESKTOP-HD2ANFT\\MSSQLSERVER03;"
            "DATABASE=PTD_Database;"
            "Trusted_Connection=yes;"
        )
        return conn
    except pyodbc.Error as e:
        print(f"❌ LỖI KẾT NỐI DATABASE: {str(e)}")
        print(f"📋 Chi tiết:")
        print(f"   - Server: DESKTOP-HD2ANFT\\MSSQLSERVER03")
        print(f"   - Database: PTD_Database")
        print(f"\n💡 Hướng dẫn khắc phục:")
        print(f"   1. Kiểm tra SQL Server đã chạy chưa")
        print(f"   2. Kiểm tra tên database 'PTD_Database' đã tồn tại chưa")
        print(f"   3. Kiểm tra tên instance SQL Server có đúng không")
        print(f"   4. Chạy file PTD_SQL.sql để tạo database và các bảng")
        raise

print("✅ Module db.py đã load")
