const fs = require('fs');
const path = require('path');

function moveTooltipsRightAndFixOverflow(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Change tooltip position back to right side
  const oldTooltip = 'absolute top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] leading-tight font-medium px-1 py-1 rounded shadow-lg z-[100] w-[70px] text-center whitespace-normal';
  const newTooltip = 'absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap';

  content = content.replaceAll(oldTooltip, newTooltip);

  // Change nav overflow
  // <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
  const navOld = '<nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">';
  const navNew = '<nav className={`flex-1 p-4 space-y-1 scrollbar-thin ${isCollapsed ? \'overflow-visible\' : \'overflow-y-auto\'}`}>';
  
  if (content.includes(navOld)) {
    content = content.replace(navOld, navNew);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

const dir = path.join(__dirname, 'frontend', 'src', 'Components', 'Sidebar');
moveTooltipsRightAndFixOverflow(path.join(dir, 'Sidebar.jsx'));
moveTooltipsRightAndFixOverflow(path.join(dir, 'SidebarRecruiter.jsx'));
moveTooltipsRightAndFixOverflow(path.join(dir, 'SidebarInterviewer.jsx'));
