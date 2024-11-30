const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const http = require('http');
const socketHandlers = require('./utils/socketHandlers'); // Ajusta la ruta según la ubicación de socketHandlers.js

// Importar rutas
const teamsRoutes = require('./routes/teams');
const matchesRoutes = require('./routes/matches');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const leaguesRoutes = require('./routes/leagues');
const statisticsRoutes = require('./routes/statistics');
const leagueDetailsRoutes = require('./routes/leagueDetails'); // Rutas para los detalles de liga
const matchDetailsRoutes = require('./routes/matchDetails');
const lineupsRoutes = require('./routes/lineups.routes');
const refereesRoutes = require('./routes/referees.routes');
const teamDetailsRoutes = require('./routes/teamDetailsRoutes');

// Configuración de la aplicación y servidor HTTP
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/futbol';

// Validar configuración de variables de entorno
if (!MONGO_URI || !process.env.API_KEY) {
    console.error('Falta configurar MONGO_URI o API_KEY en las variables de entorno');
    process.exit(1);
}

// Middleware para CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:4200'
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas
app.use('/api/teams', teamsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/leagues', leaguesRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/league', leagueDetailsRoutes);
app.use('/api', matchDetailsRoutes);
app.use('/api/lineups', lineupsRoutes);
app.use('/api/referees', refereesRoutes);
app.use('/api/team-details', teamDetailsRoutes);


// Ruta raíz de la API
app.get('/', (req, res) => {
    res.send('API de Fútbol en funcionamiento');
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// Configuración de Socket.io para WebSockets
socketHandlers(io);

// Iniciar el servidor HTTP y WebSockets
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Importar y ejecutar los cron jobs
require('./cronJobs/liveMatchesUpdater');
