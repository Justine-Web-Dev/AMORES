const fs = require('fs');
const path = require('path');

function updateHoverStyles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Change 1: padding and border radius
  content = content.replaceAll(
    "className={`group relative flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'} rounded-lg",
    "className={`group relative flex items-center ${isCollapsed ? 'justify-center mx-2 py-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl"
  );

  // Change 2: hover background and shadow
  content = content.replaceAll(
    "text-slate-500 hover:text-slate-900 hover:bg-white/50",
    "text-slate-500 hover:text-slate-900 hover:bg-white/80 hover:shadow-sm"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Hover styles updated in ' + filePath);
}

const dir = path.join(__dirname, 'frontend', 'src', 'Components', 'Sidebar');
updateHoverStyles(path.join(dir, 'Sidebar.jsx'));
