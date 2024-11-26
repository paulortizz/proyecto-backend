const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
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
  founded: {
    type: Number,
    required: true,
    min: [1800, 'El equipo no puede haberse fundado antes de 1800']
  },
  logo: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v); 
      },
      message: props => `${props.value} no es una URL válida para el logo!`
    }
  },
  venue: {
    name: { type: String, trim: true, required: false },
    address: { type: String, trim: true, required: false },
    city: { type: String, trim: true, required: false },
    capacity: { type: Number, min: [0, 'La capacidad del estadio debe ser mayor que 0'], required: false },
    image: {
      type: String,
      validate: {
        validator: function(v) {
          return v ? /^(http|https):\/\/[^ "]+$/.test(v) : true;
        },
        message: props => `${props.value} no es una URL válida para la imagen del estadio!`
      },
      required: false
    }
  }
});

// Agregar índices para consultas eficientes
teamSchema.index({ externalId: 1 });
teamSchema.index({ name: 1 });

module.exports = mongoose.model('Team', teamSchema);
