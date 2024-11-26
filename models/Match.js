// models/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    // Define los campos que necesitas para el modelo de partidos
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    status: { type: String, required: true }, // Por ejemplo: 'live', 'finished', etc.
    // Agrega más campos según sea necesario
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
