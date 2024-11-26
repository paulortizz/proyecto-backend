const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Para validar ObjectIds
const auth = require('../middlewares/auth');
const User = require('../models/User');
const Team = require('../models/Team');

// Agregar un equipo a favoritos (protegido)
router.post('/add', auth, async (req, res) => {
  const { teamId } = req.body;

  // Validar que el teamId es un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).json({ msg: 'ID de equipo no válido' });
  }

  try {
    let user = await User.findById(req.user.id);

    // Verificar si el equipo ya está en favoritos
    if (user.favorites.teams.includes(teamId)) {
      return res.status(400).json({ msg: 'El equipo ya está en favoritos' });
    }

    // Agregar el equipo a favoritos
    user.favorites.teams.push(teamId);
    await user.save();

    // Devolver los equipos favoritos con más información usando populate
    await user.populate('favorites.teams').execPopulate();
    res.json(user.favorites.teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Eliminar un equipo de favoritos (protegido)
router.delete('/remove/:teamId', auth, async (req, res) => {
  const { teamId } = req.params;

  // Validar que el teamId es un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).json({ msg: 'ID de equipo no válido' });
  }

  try {
    let user = await User.findById(req.user.id);

    // Filtrar los equipos favoritos para eliminar el seleccionado
    user.favorites.teams = user.favorites.teams.filter(fav => fav.toString() !== teamId);
    await user.save();

    // Devolver los equipos favoritos actualizados
    await user.populate('favorites.teams').execPopulate();
    res.json(user.favorites.teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener equipos favoritos (protegido)
router.get('/', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).populate('favorites.teams');
    res.json(user.favorites.teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
