import re

with open('src/components/CVRenderer.tsx', 'r') as f:
    content = f.read()

# Fix types in CVRenderer
content = content.replace("const sections = Array.from(el.querySelectorAll('section'));", "const sections = Array.from(el.querySelectorAll('section')) as HTMLElement[];")
content = content.replace("const children = Array.from(section.children) as HTMLElement[];", "const children = Array.from((section as HTMLElement).children) as HTMLElement[];")

with open('src/components/CVRenderer.tsx', 'w') as f:
    f.write(content)
