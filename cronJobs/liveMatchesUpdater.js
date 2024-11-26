const cron = require('node-cron');
const axios = require('axios');
const redisClient = require('../cache'); // Usar Redis para almacenar los datos en caché

// Función para obtener partidos en vivo de la API de Football Data
const fetchLiveMatches = async () => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
            headers: { 'x-apisports-key': process.env.API_KEY },
            params: { live: true }
        });
        return response.data.response;
    } catch (error) {
        console.error('Error fetching live matches:', error.message);
        return null;
    }
};

// Tarea programada para actualizar partidos en vivo cada minuto
cron.schedule('*/1 * * * *', async () => {
    console.log('Actualizando partidos en vivo cada minuto...');
    const liveMatches = await fetchLiveMatches();

    if (liveMatches) {
        // Cachear los partidos en vivo en Redis por 60 segundos
        redisClient.setex('liveMatches', 60, JSON.stringify(liveMatches));
        console.log('Partidos en vivo actualizados y cacheados');
    }
});
