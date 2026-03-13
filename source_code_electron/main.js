const path = require('path');
const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const settings = require('electron-settings');
const { loadCredentials } = require('./services/auth');

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false, 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true, // Padrão recomendado na v35+
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'usr', 'share', 'icons', 'hicolor', '256x256', 'apps', 'microsoft-office-365.png')
  });

  // Carrega a URL inicial
  mainWindow.loadURL('https://www.office.com/login');
  
  // Remove o menu padrão para uma aparência de App nativo
  Menu.setApplicationMenu(null);

  // --- Lógica de Zoom Persistente ---
  const applySavedZoom = async () => {
    const savedZoom = await settings.get('zoomLevel');
    if (savedZoom !== undefined) {
      mainWindow.webContents.setZoomLevel(parseFloat(savedZoom));
    }
  };

  const registerShortcuts = () => {
    // Zoom In: Ctrl + Win + Alt + I
    globalShortcut.register('CommandOrControl+Super+Alt+I', async () => {
      const currentZoom = mainWindow.webContents.getZoomLevel();
      const newZoom = currentZoom + 0.5;
      mainWindow.webContents.setZoomLevel(newZoom);
      await settings.set('zoomLevel', newZoom);
    });

    // Zoom Out: Ctrl + Win + Alt + O
    globalShortcut.register('CommandOrControl+Super+Alt+O', async () => {
      const currentZoom = mainWindow.webContents.getZoomLevel();
      const newZoom = currentZoom - 0.5;
      mainWindow.webContents.setZoomLevel(newZoom);
      await settings.set('zoomLevel', newZoom);
    });

    // Reset Zoom (100%): Ctrl + Win + Alt + P
    globalShortcut.register('CommandOrControl+Super+Alt+P', async () => {
      mainWindow.webContents.setZoomLevel(0);
      await settings.set('zoomLevel', 0);
    });
  };

  // Evento disparado quando a página termina de carregar
  mainWindow.webContents.on('did-finish-load', async () => {
    // 1. Aplica o zoom que ficou salvo
    await applySavedZoom();

    // 2. Tenta preenchimento automático de credenciais
    const creds = await loadCredentials();
    if (creds) {
      const code = `
        (function() {
          const emailInput = document.querySelector('input[type="email"]');
          if (emailInput && !emailInput.value) {
            emailInput.value = "${creds.user}";
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        })();
      `;
      mainWindow.webContents.executeJavaScript(code).catch(e => console.log('Aguardando campo...'));
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
    registerShortcuts();
  });

  // Mantém links externos dentro da mesma janela
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    mainWindow.loadURL(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicialização e Ciclo de Vida
app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('will-quit', () => {
  // Limpa os atalhos para não dar conflito com outros apps ao fechar
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
