import sys
sys.path.append('c:/Users/Manav Darji/Desktop/Project/Website')
from app import get_mysql_connection

mysql = get_mysql_connection()
cur = mysql.cursor()
cur.execute("DESCRIBE teachers;")
columns = cur.fetchall()
for col in columns:
    print(col)
