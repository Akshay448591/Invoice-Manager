const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// One User model for both roles.
// role "business" -> signs up on their own and creates invoices.
// role "client"   -> created by a business user when they add a client.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['business', 'client'], default: 'business' },
    businessName: { type: String, trim: true }, // only for business users
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
