const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// Registro de usuario
router.post(
  '/register',
  [
    check('name', 'El nombre es obligatorio').trim().not().isEmpty(),
    check('email', 'Por favor incluye un correo electrónico válido').isEmail().normalizeEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Validar entradas
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Verificar si el usuario ya existe
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'El usuario ya existe' });
      }

      // Crear nuevo usuario
      user = new User({
        name,
        email,
        password
      });

      // Cifrar la contraseña
      user.password = await bcrypt.hash(password, 10); // Genera la "salt" automáticamente

      // Guardar usuario en la base de datos
      await user.save();

      // Crear y firmar el JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      // Firmar el JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // Expira en 1 hora
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
  }
);

// Inicio de sesión de usuario
router.post(
  '/login',
  [
    check('email', 'Por favor incluye un correo electrónico válido').isEmail(),
    check('password', 'La contraseña es obligatoria').exists()
  ],
  async (req, res) => {
    // Validar entradas
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Verificar si el usuario existe
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      // Comparar la contraseña ingresada con la guardada
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
      }

      // Crear y firmar el JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      // Firmar el JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // Expira en 1 hora
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
  }
);

module.exports = router;
