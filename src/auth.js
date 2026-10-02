const jwt = require("jsonwebtoken");

function autenticar(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { autenticar };
