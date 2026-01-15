import pyodbc

def get_db():
    return pyodbc.connect(
        "DRIVER={SQL Server};"
        "SERVER=DESKTOP-HD2ANFT\\MSSQLSERVER03;"
        "DATABASE=PTD_SQL;"
        "Trusted_Connection=yes;"
    )

print("DB CONNECT OK")
