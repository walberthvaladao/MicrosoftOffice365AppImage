// services/auth.js
const { safeStorage } = require('electron');
const settings = require('electron-settings');

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

