// Копирует статические файлы игры в каталог обёртки (Electron/Capacitor).
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const dest = path.resolve(process.cwd(), process.argv[2] || 'app');
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const f of ['index.html', 'css', 'js', 'fonts', 'flags', 'i18n']) fs.cpSync(path.join(root, f), path.join(dest, f), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'icons', 'icon.png'), path.join(dest, 'icon.png'));
console.log('copied web assets to', dest);
