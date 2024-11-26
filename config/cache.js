const redis = require('redis');

// Crea un cliente de Redis
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379' // Cambia la URL según tu configuración
});

// Maneja errores de conexión
redisClient.on('error', (err) => {
    console.error('Error de Redis:', err);
});

// Conecta a Redis
(async () => {
    await redisClient.connect();
    console.log('Conectado a Redis');
})();

module.exports = redisClient;
