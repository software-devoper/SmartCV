import os
import re

forms = {
    'PersonalForm.tsx': {'email': 80, 'phone': 30, 'location': 80, 'linkedin': 100, 'portfolio': 100},
    'ProjectsForm.tsx': {'title': 80, 'tools': 120, 'link': 120, 'description': 150},
    'EducationForm.tsx': {'institution': 80, 'degree': 50, 'field': 80, 'gpa': 10, 'startDate': 20, 'endDate': 20},
    'SkillsForm.tsx': {'category': 50, 'items': 150},
    'CertificationsForm.tsx': {'name': 80, 'issuer': 80, 'date': 20, 'expiryDate': 20, 'url': 120},
    'AchievementsForm.tsx': {'title': 80, 'issuer': 80, 'date': 20, 'description': 120},
    'ExtracurricularsForm.tsx': {'activityName': 80, 'role': 80, 'organization': 80, 'startDate': 20, 'endDate': 20, 'description': 150},
    'LanguagesForm.tsx': {'language': 50, 'level': 50},
    'ReferencesForm.tsx': {'name': 80, 'position': 80, 'company': 80, 'email': 80, 'phone': 30, 'relationship': 50}
}

for filename, rules in forms.items():
    filepath = f"src/components/forms/{filename}"
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()

    # The inputs usually look like:
    # <input ... value={proj.title} onChange={e => updateProject(index, 'title', e.target.value)} ... />
    # or <input ... value={data.contact?.email || ''} onChange={e => updateNested('contact', { ...data.contact, email: e.target.value })} ... />
    
    for field, length in rules.items():
        # Match input or textarea with that field name
        
        # We look for a pattern like: value={...field...} ... onChange={... field ...} ... />
        # and insert maxLength={length} inside it.
        # Then append <CharacterCounter current={...} max={length} /> after it.
        
        # Let's do this by finding <input ... /> or <textarea ... />
        
        # A simpler way: since we know the structure:
        # <div>
        #   <label>...</label>
        #   <input ... value={something} ... onChange={... 'field' ...} ... />
        # </div>
        pass
