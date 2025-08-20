const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getUsersByRole = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = { role };
    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }
    const users = await User.find(query);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role, status: 'active' });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// PUT /users/:id
exports.updateUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const updateData = { username, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// PATCH /users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ message: 'User status updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};