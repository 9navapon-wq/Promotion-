import json
import re
import os

# We will save the CSV data and parse it into promotionsData.json
def parse_csv_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split lines respecting quotes
    lines = []
    current_line = []
    field = ''
    in_quote = False
    
    i = 0
    while i < len(content):
        c = content[i]
        if c == '"':
            if in_quote and i + 1 < len(content) and content[i + 1] == '"':
                field += '"'
                i += 1
            else:
                in_quote = not in_quote
        elif c == ',' and not in_quote:
            current_line.append(field.strip())
            field = ''
        elif c in ('\r', '\n') and not in_quote:
            if c == '\r' and i + 1 < len(content) and content[i + 1] == '\n':
                i += 1
            current_line.append(field.strip())
            field = ''
            if any(current_line):
                lines.append(current_line)
            current_line = []
        else:
            field += c
        i += 1
    if field or current_line:
        current_line.append(field.strip())
        if any(current_line):
            lines.append(current_line)

    return lines

print("CSV parser function defined")
