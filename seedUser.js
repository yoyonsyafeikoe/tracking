const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/tracker_db', { useNewUrlParser: true, useUnifiedTopology: true });

async function createUser() {
  const plainPassword = '1234';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const newUser = new User({
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
    status: 'active'
  });

  await newUser.save();
  console.log('User created');
  mongoose.disconnect();
}

createUser();
