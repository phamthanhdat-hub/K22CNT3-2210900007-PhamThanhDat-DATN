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
        # NOTE: Avoid emojis here to prevent Windows console encoding errors.
        print(f"[DB ERROR] Failed to connect: {str(e)}")
        print("[DB INFO]")
        print("  - Server: DESKTOP-HD2ANFT\\MSSQLSERVER03")
        print("  - Database: PTD_Database")
        print("\n[HINT]")
        print("  1. Check SQL Server service is running")
        print("  2. Check database 'PTD_Database' exists")
        print("  3. Check SQL Server instance name is correct")
        print("  4. Run PTD_SQL.sql to create DB/tables")
        raise

# Avoid emojis to prevent encoding issues on Windows terminals.
print("[DB] db.py loaded")
