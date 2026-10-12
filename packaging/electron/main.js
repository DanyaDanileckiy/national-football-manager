// Electron-обёртка: игра грузится из локальных файлов, сохранения (IndexedDB) лежат в userData.
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
app.setName('NationalFootballManager');
app.setPath('userData', path.join(app.getPath('appData'), 'NationalFootballManager'));
const TITLE = 'Сборная: Футбольный Менеджер';
function create() {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 360, minHeight: 600, title: TITLE,
    backgroundColor: '#050f1d', icon: path.join(__dirname, 'app', 'icon.png'),
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  win.on('page-title-updated', e => { e.preventDefault(); win.setTitle(TITLE); });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('before-input-event', (e, i) => { if (i.type === 'keyDown' && i.key === 'F11') win.setFullScreen(!win.isFullScreen()); });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}
if (!app.requestSingleInstanceLock()) app.quit();
else { app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } }); app.whenReady().then(create); }
app.on('window-all-closed', () => app.quit());
