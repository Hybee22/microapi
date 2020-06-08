const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name.'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name.'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email.'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (el) {
          return validator.isEmail(el);
        },
        message: 'Please provide a valid email',
      },
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // If password was modified
  if (!this.isModified('password')) return next();

  // Hash Password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Remove password confirm from being persisted
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
