const fs = require('fs');
const path = require('path');
const targets = ['dist', 'dist.zip'];
let removedAny = false;
let hadError = false;

console.log(`[clean] cwd=${process.cwd()}`);

const removeRecursive = (targetPath) => {
  const stat = fs.lstatSync(targetPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      removeRecursive(path.join(targetPath, entry));
    }
    fs.rmdirSync(targetPath);
    return;
  }
  fs.unlinkSync(targetPath);
};

for (const target of targets) {
  const targetPath = path.resolve(process.cwd(), target);
  if (fs.existsSync(targetPath)) {
    try {
      removeRecursive(targetPath);
    } catch (error) {
      hadError = true;
      console.error(`[clean] failed to remove ${target}:`, error);
    }
    if (!fs.existsSync(targetPath)) {
      removedAny = true;
      console.log(`[clean] removed ${target}`);
    } else {
      hadError = true;
      console.error(`[clean] still exists after delete: ${target}`);
    }
  }
}

if (!removedAny) {
  console.log('[clean] nothing to remove');
}

if (hadError) {
  process.exitCode = 1;
}
