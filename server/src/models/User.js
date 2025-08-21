const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
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
    birthDate: {
        type: Date,
        required: [true, 'Birth date is required'],
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
    },
    refreshToken: {
        type: String,
        required: [true, 'Refresh token is required'],
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});
// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredpassword) {
    if (enteredpassword) {
        return await bcrypt.compare(enteredpassword, this.password)
    }

}

module.exports = mongoose.model('User', userSchema);