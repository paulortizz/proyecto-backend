// utils/footballApi.js
const axios = require('axios');

const footballApi = axios.create({
    baseURL: 'https://v3.football.api-sports.io', // Base URL de la API externa
    headers: {
        'x-apisports-key': process.env.API_KEY  // Usa tu clave de API desde una variable de entorno
    }
});

module.exports = footballApi;
