#!/usr/bin/env python3

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Tambah .btn-red di CSS
content = content.replace(
    '.btn-green{background:transparent;border-color:var(--green);color:var(--green);}',
    '.btn-green{background:transparent;border-color:var(--green);color:var(--green);}\n  .btn-red{background:transparent;border-color:var(--red);color:var(--red);}'
)

# 2. Tambah tombol shuffle
content = content.replace(
    '<input type="file" id="excelInput" accept=".xlsx,.xls" />',
    '<button class="btn btn-red" id="shuffleBtn">🔀 Acak Urutan</button>\n    <input type="file" id="excelInput" accept=".xlsx,.xls" />'
)

# 3. Tambah const shuffleBtn
content = content.replace(
    "const nextOrderBtn = document.getElementById('nextOrderBtn');",
    "const nextOrderBtn = document.getElementById('nextOrderBtn');\n  const shuffleBtn = document.getElementById('shuffleBtn');"
)

# 4. Tambah fungsi stopSpinning
stop_fn = '''
  function stopSpinning(){
    if (spinTimeout) clearTimeout(spinTimeout);
    spinTimeout = null;
    isSpinning = false;
    pickBtn.disabled = false;
    shuffleBtn.disabled = false;
  }
'''
content = content.replace('  function loadTabData(tabId){', stop_fn + '\n  function loadTabData(tabId){')

# 5. Update spinner clear di loadTabData
content = content.replace(
    '    if (isSpinning){\n      clearTimeout(spinTimeout); spinTimeout = null; isSpinning = false;\n      pickBtn.disabled = false;\n    }',
    '    stopSpinning();'
)

# 6. Tambah stopSpinning() call di loadTabData
content = content.replace(
    '    updateStudentCount();\n    updateModeBadge();\n    updateOrderIndicator();\n\n    resultDisplay.classList.remove',
    '    updateStudentCount();\n    updateModeBadge();\n    updateOrderIndicator();\n    stopSpinning();\n\n    resultDisplay.classList.remove'
)

# 7. Better restore validation
content = content.replace(
    "if (!data || !data.tabs || Object.keys(data.tabs).length === 0) return false;",
    "if (!data || !data.tabs || typeof data.tabs !== 'object' || Object.keys(data.tabs).length === 0) return false;"
)

# 8. Disable shuffleBtn saat spin
content = content.replace(
    'isSpinning = true;\n    pickBtn.disabled = true;\n    resultDisplay.classList.remove',
    'isSpinning = true;\n    pickBtn.disabled = true;\n    shuffleBtn.disabled = true;\n    resultDisplay.classList.remove'
)

# 9. Add shuffle listener
content = content.replace(
    "uploadExcelBtn.addEventListener('click', () => excelInput.click());",
    "shuffleBtn.addEventListener('click', shuffleOrder);\n\n  uploadExcelBtn.addEventListener('click', () => excelInput.click());"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Patch berhasil!')
