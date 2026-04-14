import sys
import re

with open(r'c:\Users\Manav Darji\Desktop\Project\Website\app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
i = 0
found_leaks = 0

while i < len(lines):
    new_lines.append(lines[i])
    # Look for finally: followed by cur.close() but NOT mysql.close()
    if lines[i].strip() == "finally:":
        # look ahead
        j = i + 1
        has_cur_close = False
        has_mysql_close = False
        while j < len(lines) and (lines[j].startswith(" ") or lines[j].startswith("\t") or lines[j].strip() == ""):
            if "cur.close()" in lines[j]:
                has_cur_close = True
            if "mysql.close()" in lines[j]:
                has_mysql_close = True
            j += 1
            
        if has_cur_close and not has_mysql_close:
            found_leaks += 1
            # We will insert mysql.close() right after cur.close()
    i += 1

print(f"Functions with missing mysql.close() in finally: {found_leaks}")
