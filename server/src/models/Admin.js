const mongoose = require('mongoose');
const bcrypt = require("bcrypt");   

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  refreshToken: {
    type: String,
    select: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
// adminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// Method to compare passwords


    adminSchema.methods.matchPassword = async function (enteredpassword) {
        if (enteredpassword) {
            return await bcrypt.compare(enteredpassword, this.password)
        }
    
    }

module.exports = mongoose.model('Admin', adminSchema);