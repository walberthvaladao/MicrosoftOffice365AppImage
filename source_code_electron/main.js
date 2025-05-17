const path = require('path');
const { app, BrowserWindow, Menu, safeStorage } = require('electron');
const settings = require('electron-settings');

let mainWindow;

async function saveCredentials(username, password) {
  const encryptedUser = safeStorage.encryptString(username);
  const encryptedPass = safeStorage.encryptString(password);
  
  await settings.set('credentials', {
    user: encryptedUser.toString('latin1'),
    pass: encryptedPass.toString('latin1')
  });
}

async function loadCredentials() {
  const stored = await settings.get('credentials');
  if (!stored) return null;

  return {
    user: safeStorage.decryptString(Buffer.from(stored.user, 'latin1')),
    pass: safeStorage.decryptString(Buffer.from(stored.pass, 'latin1'))
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'usr', 'share', 'icons', 'hicolor', '256x256', 'apps', 'microsoft-office-365.png')
  });

  mainWindow.loadURL('https://www.office.com/login');

  Menu.setApplicationMenu(null);

  // Impede abrir novas janelas e carrega URL na mesma janela
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    mainWindow.loadURL(url);
    return { action: 'deny' };
  });

  mainWindow.maximize();
  mainWindow.show();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

