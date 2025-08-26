const express = require('express');
const router = express.Router();
const client = require('../config/whatsappClient');

// Enviar un mensaje de prueba
router.post('/send', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Número y mensaje requeridos' });
  }

  try {
    const chatId = to.includes('@c.us') ? to : `${to}@c.us`; // formato correcto
    await client.sendMessage(chatId, message);

    res.json({ success: true, to, message });
  } catch (err) {
    console.error('❌ Error enviando mensaje:', err);
    res.status(500).json({ error: 'Error enviando mensaje' });
  }
});

module.exports = router;
