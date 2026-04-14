import re
import sys

def main():
    file_path = r'c:\Users\Manav Darji\Desktop\Project\Website\app.py'
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    refactored_lines = []
    i = 0
    replacements = 0
    
    while i < len(lines):
        # Look for mysql = get_mysql_connection()
        match_conn = re.match(r'^([ \t]*)([a-zA-Z0-9_]+)\s*=\s*get_mysql_connection\(\)\s*$', lines[i])
        if match_conn:
            indent = match_conn.group(1)
            conn_var = match_conn.group(2)
            
            # Look for cursor definition in next lines (skipping blanks/comments)
            j = i + 1
            cur_line = None
            cur_var = None
            while j < len(lines):
                line_str = lines[j].strip()
                if line_str == "" or line_str.startswith("#"):
                    j += 1
                    continue
                match_cur = re.match(r'^([ \t]*)([a-zA-Z0-9_]+)\s*=\s*' + conn_var + r'\.cursor\(.*?dictionary=True.*?\)\s*$', lines[j])
                # OR support match without dictionary=True
                if not match_cur:
                    match_cur = re.match(r'^([ \t]*)([a-zA-Z0-9_]+)\s*=\s*' + conn_var + r'\.cursor\(.*?\)\s*$', lines[j])
                    
                if match_cur:
                    cur_line = j
                    cur_var = match_cur.group(2)
                break
            
            if cur_line:
                # Look for try:
                k = cur_line + 1
                try_line = None
                while k < len(lines):
                    line_str = lines[k].strip()
                    if line_str == "" or line_str.startswith("#"):
                        k += 1
                        continue
                    if lines[k].rstrip() == indent + "try:":
                        try_line = k
                    break
                
                if try_line:
                    # We found the block initialization!
                    replacements += 1
                    for blank in range(i, try_line):
                        if lines[blank].strip() == "" or lines[blank].strip().startswith('#'):
                            # Keep comments
                            if lines[blank].strip().startswith('#'):
                                refactored_lines.append(lines[blank])
                            else:
                                refactored_lines.append(lines[blank])
                    
                    refactored_lines.append(f"{indent}try:\n")
                    refactored_lines.append(f"{indent}    with mysql_connection() as ({conn_var}, {cur_var}):\n")
                    
                    # Now we must indent everything inside the try block
                    m = try_line + 1
                    in_try = True
                    in_except = False
                    in_finally = False
                    
                    while m < len(lines):
                        line_m = lines[m]
                        line_m_stripped = line_m.strip()
                        
                        # Stop if we drop below original indent
                        if line_m_stripped != "":
                            current_indent_len = len(line_m) - len(line_m.lstrip())
                            if current_indent_len < len(indent):
                                break
                                
                            if current_indent_len == len(indent):
                                if line_m.startswith(indent + "except"):
                                    in_try = False
                                    in_except = True
                                    in_finally = False
                                elif line_m.startswith(indent + "finally:"):
                                    in_try = False
                                    in_except = False
                                    in_finally = True
                                    m += 1
                                    continue # Skip adding finally:
                                elif not in_try and not in_except and not in_finally:
                                    break # Reached end of block structures
                        
                        if in_try:
                            # Add 4 spaces to inner try lines
                            if line_m_stripped != "":
                                refactored_lines.append("    " + line_m)
                            else:
                                refactored_lines.append(line_m)
                        elif in_except:
                            refactored_lines.append(line_m)
                        elif in_finally:
                            # Skip lines containing connection and cursor closing
                            skip_keywords = [
                                "if cur", "if mysql", "cur.close()", "mysql.close()", 
                                f"if {cur_var}", f"if {conn_var}", 
                                f"{cur_var}.close()", f"{conn_var}.close()",
                                "pass"
                            ]
                            should_skip = False
                            for kw in skip_keywords:
                                if line_m_stripped.startswith(kw):
                                    should_skip = True
                                    break
                            
                            if not should_skip and line_m_stripped != "":
                                refactored_lines.append(line_m)
                        
                        m += 1
                    
                    i = m
                    continue
        
        refactored_lines.append(lines[i])
        i += 1
        
    print(f"Replaced {replacements} occurrences.")
    with open(r'c:\Users\Manav Darji\Desktop\Project\Website\app.py', 'w', encoding='utf-8') as f:
        f.writelines(refactored_lines)

if __name__ == '__main__':
    main()
