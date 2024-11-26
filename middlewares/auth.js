const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Leer el token del header Authorization
  const authHeader = req.header('Authorization');
  
  // Revisar si no hay token
  if (!authHeader) {
    return res.status(401).json({ msg: 'No hay token, permiso no válido' });
  }

  // El token debe venir en el formato 'Bearer token'
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(400).json({ msg: 'Formato de token no válido. Debe ser "Bearer token"' });
  }

  const token = tokenParts[1];

  // Validar el token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next(); // Continuar al siguiente middleware o controlador
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expirado, por favor inicia sesión de nuevo' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token no válido' });
    } else {
      console.error('Error al verificar token:', err.message);
      return res.status(500).json({ msg: 'Error en el servidor al verificar token' });
    }
  }
};
