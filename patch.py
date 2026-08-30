import re

def process_file(filepath, limits):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add CharacterCounter import if missing and needed
    if 'CharacterCounter' not in content and 'maxLength' in limits:
        content = re.sub(r'(import React from \'react\';)', r'\1\nimport CharacterCounter from \'./CharacterCounter\';', content)

    # We will just write regex to replace "Add XXX" buttons and textareas/inputs manually for each file
    
    with open(filepath, 'w') as f:
        f.write(content)
