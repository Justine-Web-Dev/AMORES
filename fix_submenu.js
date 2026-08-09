const fs = require('fs');
const path = require('path');

function fixSubmenuTooltips(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to add `group relative ` before `flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'}`
  const target = "className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'}";
  const replacement = "className={`group relative flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'}";

  if (content.includes(target)) {
    content = content.replaceAll(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed submenu in ' + filePath);
  }
}

const dir = path.join(__dirname, 'frontend', 'src', 'Components', 'Sidebar');
fixSubmenuTooltips(path.join(dir, 'Sidebar.jsx'));
