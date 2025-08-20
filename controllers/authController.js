const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log('Login input:', { username, password });

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials - user not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials - password mismatch' });
    }

    user.status = 'active';
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: { 
        id: user._id,
        username: user.username,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
},

exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      role,
      status: 'inactive',
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', user: {
      id: user._id,
      username: user.username,
      role: user.role
    }});
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

