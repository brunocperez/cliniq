import os, re

base = 'src'
files_to_fix = []
for root, dirs, files in os.walk(base):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
    for f in files:
        if f.endswith('.tsx'):
            files_to_fix.append(os.path.join(root, f))

count = 0
for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    if 'const inputStyle' not in content:
        continue

    original = content

    content = re.sub(r'const inputStyle = \{[^}]+\}\s*\n', '', content)
    content = re.sub(r'const labelStyle = \{[^}]+\}\s*\n', '', content)

    if "from '@/lib/styles'" not in content and 'from "@/lib/styles"' not in content:
        last_import = list(re.finditer(r'^import .+$', content, re.MULTILINE))
        if last_import:
            pos = last_import[-1].end()
            content = content[:pos] + "\nimport { inputStyle, labelStyle } from '@/lib/styles'" + content[pos:]

    if content != original:
        count += 1
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print(f'Fixed {count} files')