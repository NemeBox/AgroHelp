const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'provider', 'admin'],
    default: 'customer'
  },
  phone: {
    type: String,
    required: [function() { return this.role === 'provider'; }, 'Phone number is required for providers.'],
    maxlength: [10, 'Phone number cannot be more than 10 digits.']
  }
});

// static signup method
userSchema.statics.signup = async function(name, email, password, role, phone) {
  // validation
  if (!name || !email || !password) {
    throw Error('All fields must be filled');
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // If role is not provided, the schema default ('customer') will be used
  const user = await this.create({ name, email, password: hash, role, phone });

  return user;
};

// static login method
userSchema.statics.login = async function(email, password, role) {
  if (!email || !password) {
    throw Error('All fields must be filled');
  }

  const user = await this.findOne({ email, role });
  if (!user) {
    throw Error('Incorrect email or user does not exist for this role');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error('Incorrect password');
  }

  return user;
};

module.exports = mongoose.model('User', userSchema);