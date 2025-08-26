/**
 * 📲 WhatsApp Client Config
 * Autor: Alex Laime
 * 
 * Maneja la conexión con WhatsApp usando whatsapp-web.js
 * con persistencia de sesión (no tendrás que escanear QR cada vez).
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Crear cliente con sesión persistente
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './sessions' }), // guarda sesión en /sessions
  puppeteer: {
    headless: true, // cambia a false si quieres ver navegador
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Evento: generar QR en consola
client.on('qr', (qr) => {
  console.log('📲 Escanea este QR con tu WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// Evento: cliente listo
client.on('ready', () => {
  console.log('✅ Cliente de WhatsApp conectado y listo!');
});

// Evento: desconexión
client.on('disconnected', (reason) => {
  console.log('⚠️ Cliente desconectado:', reason);
});

// Inicializar cliente
client.initialize();

module.exports = client;
