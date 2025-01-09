const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');  // Use bcryptjs instead of bcrypt

const userSchema = mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      profilePicture: {
        type: String, // URL of the profile picture
      },
      bio: {
        type: String, // A short description or biography of the user
      },
      recipes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
      favorites: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe',
        },
      ],
      followers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      following: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    { timestamps: true }
  );
// Password hashing before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password comparison
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
