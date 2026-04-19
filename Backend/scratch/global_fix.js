const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, target, replacement) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    if (data.includes(target)) {
      console.log(`Fixing ${filePath}...`);
      const result = data.split(target).join(replacement);
      fs.writeFileSync(filePath, result, 'utf8');
      return true;
    }
  } catch (err) {
    console.error(`Error in ${filePath}:`, err);
  }
  return false;
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walk(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      replaceInFile(fullPath, 'B2CManageView', 'B2CManager');
      replaceInFile(fullPath, 'CatalogPickView', 'CatalogPicker');
    }
  });
}

const frontendSrc = path.resolve(__dirname, '../../Frontend/src');
console.log(`Starting global fix in ${frontendSrc}...`);
walk(frontendSrc);
console.log('Global fix complete.');
