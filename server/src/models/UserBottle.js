import {Schema, model} from 'mongoose';

const userBottleSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
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
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        purchasePrice: {
            type: Number,
            min: 0,
        },
        currentValue: {
            type: Number,
            min: 0,
            default: function () { return this.purchasePrice; },
        },
        purchaseDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['cellar', 'drank'],
            required: true,
            default: 'cellar',
        },
    },
    { timestamps: true }
);

const UserBottle = model('UserBottle', userBottleSchema);
export default UserBottle;