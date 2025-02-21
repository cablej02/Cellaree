import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+@.+\..+/, 'Please enter a valid email address'],
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        wishlist: [
            {
                bottleId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Bottle',
                    required: true,
                },
                vintage: {
                    type: Number,
                    min: 1800,
                    max: new Date().getFullYear() + 1,
                },
                notes: {
                    type: String,
                    trim: true,
                    maxlength: 500,
                }
            },
        ],
    },
    { timestamps: true }
);

// set up pre-save middleware to create password to hash
userSchema.pre('save', async function (next) {
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
