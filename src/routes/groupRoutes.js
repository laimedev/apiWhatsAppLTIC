const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const multer = require('multer');
const { MessageMedia } = require('whatsapp-web.js');
const client = require('../config/whatsappClient');

// Configuración de multer: guarda temporalmente en /uploads
// ⚡ Configuración de Multer para guardar con nombre original
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta destino
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // mantiene extensión
  }
});
const upload = multer({ storage });



// ✅ Listar todos los grupos
router.get('/list', async (req, res) => {
  try {
    const chats = await client.getChats();
    const groups = chats
      .filter(chat => chat.isGroup)
      .map(g => ({
        id: g.id._serialized,
        name: g.name,
        participants: g.participants?.length || 0
      }));

    res.json({ success: true, groups });
  } catch (err) {
    console.error('❌ Error listando grupos:', err);
    res.status(500).json({ error: 'No se pudieron obtener los grupos' });
  }
});

// ✅ Enviar mensaje de texto a un grupo
router.post('/send', async (req, res) => {
  const { groupId, message } = req.body;

  if (!groupId || !message) {
    return res.status(400).json({ error: 'groupId y message requeridos' });
  }

  try {
    await client.sendMessage(groupId, message);
    res.json({ success: true, message: 'Mensaje enviado correctamente', groupId, content: message });
  } catch (err) {
    console.error('❌ Error enviando mensaje al grupo:', err);
    res.status(500).json({ error: 'Error enviando mensaje al grupo' });
  }
});

// ✅ Enviar multimedia en Base64
router.post('/send-media', async (req, res) => {
  const { groupId, fileBase64, fileName, mimeType, caption } = req.body;

  if (!groupId || !fileBase64 || !fileName || !mimeType) {
    return res.status(400).json({ error: 'groupId, fileBase64, fileName y mimeType son requeridos' });
  }

  try {
    const media = new MessageMedia(mimeType, fileBase64, fileName);
    await client.sendMessage(groupId, media, { caption: caption || '' });

    res.json({ success: true, message: '📎 Multimedia enviado correctamente (base64)', groupId, fileName });
  } catch (err) {
    console.error('❌ Error enviando multimedia base64:', err);
    res.status(500).json({ error: 'Error enviando multimedia al grupo' });
  }
});

// ✅ Enviar multimedia con archivo subido (multipart/form-data)
// ✅ Enviar multimedia con archivo subido (multipart/form-data)
router.post('/send-file', upload.single('file'), async (req, res) => {
  const { groupId, caption } = req.body;

  if (!groupId || !req.file) {
    return res.status(400).json({ error: 'groupId y archivo son requeridos' });
  }

  try {
    const filePath = path.join(__dirname, '../../', req.file.path);

    // 📌 Leer archivo como base64
    const fileData = fs.readFileSync(filePath, { encoding: 'base64' });

    // 📌 Detectar mime-type
    const mimeType = mime.lookup(req.file.originalname) || req.file.mimetype;
    const fileName = req.file.originalname;

    // ✅ Crear Media
    const media = new MessageMedia(mimeType, fileData, fileName);

    // 📤 Enviar archivo al grupo
    await client.sendMessage(groupId, media, { caption: caption || '' });

    // 🔥 Opcional: eliminar archivo del servidor
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: '📎 Archivo enviado correctamente',
      groupId,
      fileName
    });
  } catch (err) {
    console.error('❌ Error enviando archivo:', err);
    res.status(500).json({ error: 'Error enviando archivo al grupo' });
  }
});

module.exports = router;
