const redis = require('redis');

// Crear un cliente de Redis
const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
});

// Manejar errores de conexión
client.on('error', (err) => {
    console.error('Error en Redis:', err);
});

module.exports = client;
