import sys

with open(r'c:\Users\Manav Darji\Desktop\Project\Website\app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
i = 0
found_leaks = 0

while i < len(lines):
    new_lines.append(lines[i])
    line = lines[i]
    if "cur.close()" in line:
        # Check if the next line is mysql.close()
        # skip empty lines or comments
        j = i + 1
        has_mysql_close = False
        while j < len(lines) and (lines[j].strip() == "" or lines[j].strip().startswith('#')):
            j += 1
        
        if j < len(lines) and "mysql.close()" in lines[j]:
            has_mysql_close = True
            
        if not has_mysql_close:
            found_leaks += 1
            print(f"Found missing mysql.close() after cur.close() at line {i+1}")
            # Insert mysql.close() with the same indentation as cur.close()
            indent = line[:len(line) - len(line.lstrip())]
            new_lines.append(indent + "mysql.close()\n")
    i += 1

print(f"Total fixes applied: {found_leaks}")

with open(r'c:\Users\Manav Darji\Desktop\Project\Website\app.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
