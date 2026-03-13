const { safeStorage } = require('electron');
const settings = require('electron-settings');

/**
 * Salva credenciais usando criptografia nativa do SO.
 */
async function saveCredentials(username, password) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Criptografia nativa não disponível.');
  }

  const encryptedUser = safeStorage.encryptString(username);
  const encryptedPass = safeStorage.encryptString(password);
  
  await settings.set('credentials', {
    user: encryptedUser.toString('base64'),
    pass: encryptedPass.toString('base64')
  });
}

/**
 * Carrega e descriptografa as credenciais salvas.
 */
async function loadCredentials() {
  const stored = await settings.get('credentials');
  if (!stored || !stored.user || !stored.pass) return null;

  try {
    return {
      user: safeStorage.decryptString(Buffer.from(stored.user, 'base64')),
      pass: safeStorage.decryptString(Buffer.from(stored.pass, 'base64'))
    };
  } catch (error) {
    console.error('Erro na descriptografia:', error);
    return null;
  }
}

module.exports = { saveCredentials, loadCredentials };