import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';

import cellarBottleSchema from './CellarBottle.js';
import drankBottleSchema from './DrankBottle.js';
import wishlistBottleSchema from './WishlistBottle.js';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: false, // Remove uniqueness from the main field
        },
        username_lower: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+@.+\..+/, 'Invalid email format. Please enter a valid email.'],
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        cellar: { type: [cellarBottleSchema], default: [] },
        drankHistory: {type: [drankBottleSchema], default: [] },
        wishlist: { type: [wishlistBottleSchema], default: [] },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    // create a username_lower field for case-insensitive unique usernames
    if(this.isModified('username')) {
        this.username_lower = this.username.toLowerCase();
    }

    //create password to hash
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
  
    next();
});

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = model('User', userSchema);

export default User;
