import pyodbc

def get_connection():
    return pyodbc.connect(
        "DRIVER={SQL Server};"
        "SERVER=DESKTOP-HD2ANFT\\MSSQLSERVER03;"
        "DATABASE=ChaoBabyCutie;"
        "Trusted_Connection=yes;"
    )

