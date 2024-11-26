const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

// Definimos el esquema del usuario
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: props => `${props.value} no es un correo electrónico válido!`,
    },
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  // Referencias a los favoritos: equipos, jugadores, partidos
  favorites: {
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
    news: [{ type: mongoose.Schema.Types.ObjectId, ref: 'News' }],
  },
});

// Método para agregar un favorito
UserSchema.methods.addFavorite = function(favoriteId, type) {
  if (!this.favorites[type].includes(favoriteId)) {
    this.favorites[type].push(favoriteId);
  }
};

// Método para eliminar un favorito
UserSchema.methods.removeFavorite = function(favoriteId, type) {
  this.favorites[type] = this.favorites[type].filter(id => id.toString() !== favoriteId.toString());
};

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hook para encriptar la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
