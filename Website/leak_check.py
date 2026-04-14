import sys
import re

with open(r'c:\Users\Manav Darji\Desktop\Project\Website\app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# find all functions
funcs = re.split(r'^(?=def )', content, flags=re.MULTILINE)

issues = []
for f in funcs:
    if not f.startswith("def "): continue
    func_name = f.split("(")[0].replace("def ", "").strip()
    
    gets = len(re.findall(r'get_mysql_connection\(', f))
    closes = len(re.findall(r'mysql\.close\(', f))
    # there could be multiple return paths.
    # a safer way is to see if mysql.close() is missing entirely
    has_finally = "finally:" in f
    
    if gets > 0 and closes == 0:
        issues.append(f"{func_name}: gets {gets}, closes {closes}, has_finally: {has_finally}")
    elif gets > 0 and not has_finally:
        issues.append(f"{func_name} (NO FINALLY BLOCK): gets {gets}, closes {closes}")

for issue in issues:
    print(issue)

