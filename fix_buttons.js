const fs = require('fs');
const path = require('path');

function fixSystemUtilitiesAndLogout(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix System Utilities button
  const systemUtilsTarget = "className={`w-full flex items-center justify-between py-2.5 rounded-xl text-sm font-medium transition-all duration-200";
  const systemUtilsReplacement = "className={`group relative w-full flex items-center justify-between py-2.5 rounded-xl text-sm font-medium transition-all duration-200";
  if (content.includes(systemUtilsTarget)) {
    content = content.replace(systemUtilsTarget, systemUtilsReplacement);
  }

  // Fix Logout button
  const logoutTarget = "className={`w-full flex items-center justify-center ${isCollapsed ? 'px-2' : 'gap-2 px-4'} py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-red-500/20`}";
  const logoutReplacement = "className={`group relative w-full flex items-center justify-center ${isCollapsed ? 'px-2' : 'gap-2 px-4'} py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-red-500/20`}";
  if (content.includes(logoutTarget)) {
    content = content.replace(logoutTarget, logoutReplacement);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed buttons in ' + filePath);
}

const dir = path.join(__dirname, 'frontend', 'src', 'Components', 'Sidebar');
fixSystemUtilitiesAndLogout(path.join(dir, 'Sidebar.jsx'));
fixSystemUtilitiesAndLogout(path.join(dir, 'SidebarRecruiter.jsx'));
fixSystemUtilitiesAndLogout(path.join(dir, 'SidebarInterviewer.jsx'));
