/**
 * 🚀 WhatsApp Service - Punto de entrada
 * Autor: Alex Laime
 * Descripción:
 *   Microservicio con Express + whatsapp-web.js
 *   para enviar mensajes, listar grupos y enviar multimedia.
 */

const express = require('express');
const morgan = require('morgan'); // para logs bonitos
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors()); // habilita CORS
app.use(express.json({ limit: '20mb' })); // acepta JSON grandes (ej: PDFs en base64)
app.use(morgan('dev')); // logs de peticiones

// Importar rutas
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/groups', require('./src/routes/groupRoutes'));
app.use('/api/media', require('./src/routes/mediaRoutes'));

// Ruta base
app.get('/', (req, res) => {
  res.json({
    status: '✅ WhatsApp Service funcionando',
    endpoints: {
      messages: '/api/messages',
      groups: '/api/groups',
      media: '/api/media'
    }
  });
});

// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
