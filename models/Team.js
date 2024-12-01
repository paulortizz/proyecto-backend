const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // ID único del equipo
  name: { type: String, required: true },
  logo: String,
  country: String,
  founded: String,
  venue: {
    name: String,
    city: String,
    capacity: Number,
  },
  updatedAt: { type: Date, default: Date.now }, // Para controlar la sincronización
});

module.exports = mongoose.model('Team', TeamSchema);
