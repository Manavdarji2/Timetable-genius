import ast

with open(r'c:\Users\Manav Darji\Desktop\Project\Website\app.py', 'r', encoding='utf-8') as f:
    source = f.read()

tree = ast.parse(source)

issues = []

for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        has_conn = False
        for child in ast.walk(node):
            if isinstance(child, ast.Assign):
                for target in child.targets:
                    if getattr(target, 'id', '') == 'mysql':
                        if isinstance(child.value, ast.Call) and getattr(child.value.func, 'id', '') == 'get_mysql_connection':
                            has_conn = True
        
        if has_conn:
            # Check all close calls inside this function
            has_mysql_close = False
            has_finally = False
            for child in ast.walk(node):
                if isinstance(child, ast.Try):
                    if len(child.finalbody) > 0:
                        has_finally = True
                        for fin_stmt in child.finalbody:
                            for c2 in ast.walk(fin_stmt):
                                if isinstance(c2, ast.Call) and isinstance(c2.func, ast.Attribute):
                                    if getattr(c2.func.value, 'id', '') == 'mysql' and getattr(c2.func, 'attr', '') == 'close':
                                        has_mysql_close = True

            if not has_mysql_close:
                issues.append(node.name)

print("Functions missing mysql.close() in finally:")
for name in issues:
    print(" - " + name)
