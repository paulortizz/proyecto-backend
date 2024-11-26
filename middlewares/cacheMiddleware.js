const redisClient = require('../cache');

const cacheMiddleware = (keyPrefix) => (req, res, next) => {
    const key = `${keyPrefix}:${req.params.matchId || req.url}`;
    
    redisClient.get(key, (err, data) => {
        if (err) {
            console.error('Error al obtener datos de Redis:', err);
            return next(); // Si hay un error con Redis, continuar normalmente
        }

        if (data) {
            // Si hay datos en el caché, devolverlos
            return res.json(JSON.parse(data));
        }

        // Si no hay datos en el caché, continuar con la solicitud
        next();
    });
};

module.exports = cacheMiddleware;
