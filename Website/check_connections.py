import ast

with open('c:/Users/Manav Darji/Desktop/Project/Website/app.py', 'r', encoding='utf-8') as f:
    source = f.read()

tree = ast.parse(source)

issues = []

for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        has_conn = False
        for child in ast.walk(node):
            if isinstance(child, ast.Assign):
                for target in child.targets:
                    if isinstance(target, ast.Name) and target.id == 'mysql':
                        if isinstance(child.value, ast.Call) and isinstance(child.value.func, ast.Name) and child.value.func.id == 'get_mysql_connection':
                            has_conn = True
        
        if has_conn:
            # Check if there is a 'mysql.close()' call in the finally block
            has_finally_close = False
            has_close_at_all = False
            for child in ast.walk(node):
                if isinstance(child, ast.Try):
                    for fin in child.finalbody:
                        for stmt in ast.walk(fin):
                            if isinstance(stmt, ast.Call) and isinstance(stmt.func, ast.Attribute):
                                if isinstance(stmt.func.value, ast.Name) and stmt.func.value.id == 'mysql' and stmt.func.attr == 'close':
                                    has_finally_close = True
                if isinstance(child, ast.Call) and isinstance(child.func, ast.Attribute):
                    if isinstance(child.func.value, ast.Name) and child.func.value.id == 'mysql' and child.func.attr == 'close':
                        has_close_at_all = True
            
            if not has_finally_close:
                issues.append((node.name, node.lineno, has_close_at_all))
                
for func, line, has_close in issues:
    print(f'Function: {func} at line {line} - Has Finally Close: False - Has Close At All: {has_close}')
