import os
import re

forms = {
    'PersonalForm.tsx': {'contact.email': 80, 'contact.phone': 30, 'contact.location': 80, 'contact.linkedin': 100, 'contact.portfolio': 100},
    'ProjectsForm.tsx': {'title': 80, 'tools': 120, 'link': 120, 'description': 150, 'maxEntries': 4},
    'EducationForm.tsx': {'institution': 80, 'degree': 50, 'field': 80, 'gpa': 10, 'startDate': 20, 'endDate': 20, 'maxEntries': 4},
    'SkillsForm.tsx': {'category': 50, 'maxEntries': 5},
    'CertificationsForm.tsx': {'name': 80, 'issuer': 80, 'date': 20, 'expiryDate': 20, 'url': 120, 'maxEntries': 6},
    'AchievementsForm.tsx': {'title': 80, 'issuer': 80, 'date': 20, 'description': 120, 'maxEntries': 5},
    'ExtracurricularsForm.tsx': {'activityName': 80, 'role': 80, 'organization': 80, 'startDate': 20, 'endDate': 20, 'description': 150, 'maxEntries': 4},
    'LanguagesForm.tsx': {'language': 50, 'level': 50, 'maxEntries': 5},
    'ReferencesForm.tsx': {'name': 80, 'position': 80, 'company': 80, 'email': 80, 'phone': 30, 'relationship': 50, 'maxEntries': 3}
}

for filename, rules in forms.items():
    filepath = f"src/components/forms/{filename}"
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    if 'CharacterCounter' not in content:
        content = re.sub(r"(import React[^\n]*\n)", r"\1import CharacterCounter from './CharacterCounter';\n", content)
    
    # Process max entries on the main add button
    if 'maxEntries' in rules:
        max_entries = rules['maxEntries']
        
        # We find the button that adds an entry. It's usually the last button before </div></div> or something.
        # But we can also look for `onClick={addXXXX}`
        content = re.sub(
            r"(<button[^>]+onClick={add[A-Za-z]+}[^>]+)className=\"([^\"]+)\"",
            f"\\1disabled={{data.{filename.replace('Form.tsx', '').lower()}.length >= {max_entries}}}\n        title={{data.{filename.replace('Form.tsx', '').lower()}.length >= {max_entries} ? \"Maximum of {max_entries} entries reached for optimal resume layout\" : \"\"}}\n        className=\"\\2 disabled:opacity-50 disabled:cursor-not-allowed\"",
            content
        )
    
    with open(filepath, 'w') as f:
        f.write(content)
