const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  externalId: { 
    type: Number,
    required: true,
    unique: true 
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} no es una URL válida para el logo de la liga!`
    }
  },
  season: {
    type: Number,
    required: true,
    min: [1800, 'La temporada no puede ser antes de 1800']
  }
});

// Agregar índices para consultas eficientes
leagueSchema.index({ externalId: 1 });
leagueSchema.index({ name: 1 });

module.exports = mongoose.model('League', leagueSchema);
