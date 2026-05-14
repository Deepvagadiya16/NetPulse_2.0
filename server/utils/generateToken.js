const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload =
    typeof user === 'object'
      ? {
          id: String(user._id || user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      : { id: String(user) };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
