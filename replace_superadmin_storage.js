const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const fullPath = path.join(directory, file);
      
      fs.stat(fullPath, (err, stat) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        if (stat.isDirectory()) {
          processDirectory(fullPath);
        } else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
          fs.readFile(fullPath, 'utf8', (err, data) => {
            if (err) {
              console.error('Error reading file:', err);
              return;
            }

            // Replace localStorage with sessionStorage for token, role, must_change_password
            let modifiedData = data.replace(/localStorage\.(getItem|setItem|removeItem)\((['"])(token|role|must_change_password)\2/g, 'sessionStorage.$1($2$3$2');
            
            if (data !== modifiedData) {
              fs.writeFile(fullPath, modifiedData, 'utf8', err => {
                if (err) {
                  console.error('Error writing file:', err);
                } else {
                  console.log(`Updated ${fullPath}`);
                }
              });
            }
          });
        }
      });
    });
  });
}

processDirectory(path.join(__dirname, 'frontend-superadmin', 'src'));
