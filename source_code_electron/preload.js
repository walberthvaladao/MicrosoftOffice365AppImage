const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para a página da web (se necessário)
contextBridge.exposeInMainWorld('electronAPI', {
  // Exemplo: função para avisar o processo principal que o login ocorreu
  onLoginSuccess: (callback) => ipcRenderer.on('login-confirmed', callback)
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload carregado com sucesso.');

  // Função para tentar preencher os campos assim que eles aparecerem
  const autoFillLogin = async () => {
    // Aqui você buscaria as credenciais via IPC se quisesse automatizar 100%
    // Por segurança, muitos desenvolvedores apenas injetam um botão ou 
    // esperam um comando do processo principal.
  };

  // Exemplo de como selecionar campos no Office 365
  // Nota: A Microsoft altera esses seletores frequentemente por segurança.
  const emailField = document.querySelector('input[type="email"]');
  if (emailField) {
    // emailField.value = "seu-email@dominio.com";
  }
});