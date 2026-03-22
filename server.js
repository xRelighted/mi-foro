const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Archivo para persistencia (opcional)
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Cargar mensajes desde el archivo o inicializar array vacío
let messages = [];
if (fs.existsSync(MESSAGES_FILE)) {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    messages = JSON.parse(data);
  } catch (err) {
    console.error('Error al leer messages.json:', err);
  }
}

// Guardar mensajes en archivo (cada vez que se modifica)
function saveMessages() {
  fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), (err) => {
    if (err) console.error('Error al guardar mensajes:', err);
  });
}

// Endpoint para obtener todos los mensajes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// Endpoint para agregar un nuevo mensaje
app.post('/api/messages', (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'Faltan campos' });
  }
  const newMessage = {
    id: Date.now(),
    author: author.trim(),
    text: text.trim(),
    timestamp: new Date().toISOString()
  };
  messages.unshift(newMessage); // los nuevos primero
  saveMessages();
  res.status(201).json(newMessage);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
