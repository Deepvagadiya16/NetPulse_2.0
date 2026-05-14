const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const mockStore = require('../mockStore');
const { isDatabaseConnected } = require('../utils/dbState');

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user),
});

const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!isDatabaseConnected()) {
      const user = mockStore.getUserByEmail(email);

      if (user && user.password === password) {
        return res.json(buildAuthResponse(user));
      }

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.json(buildAuthResponse(user));
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!isDatabaseConnected()) {
      const userExists = mockStore.getUserByEmail(email);

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = {
        _id: mockStore.generateId(),
        name,
        email,
        password,
        role: role || 'Customer',
        status: 'Active',
        isActive: true,
        createdAt: new Date(),
        planId: null,
      };

      mockStore.users.push(user);
      return res.status(201).json(buildAuthResponse(user));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Customer',
    });

    if (user) {
      return res.status(201).json(buildAuthResponse(user));
    }

    res.status(400).json({ message: 'Invalid user data' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
};
