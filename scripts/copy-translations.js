const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const translationsDir = path.resolve(__dirname, '../translations');
const distDir = path.resolve(__dirname, `../dist/${pkg.name}/translations`);

if (!fs.existsSync(translationsDir)) {
  console.log('No translations directory found, skipping copy.');
  process.exit(0);
}

fs.mkdirSync(distDir, { recursive: true });

const files = fs.readdirSync(translationsDir).filter((f) => f.endsWith('.json'));
for (const file of files) {
  fs.copyFileSync(
    path.join(translationsDir, file),
    path.join(distDir, file),
  );
}

console.log(`Copied ${files.length} translation file(s) to dist.`);
