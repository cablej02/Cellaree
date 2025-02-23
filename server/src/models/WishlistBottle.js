import {Schema } from 'mongoose';

const wishlistBottleSchema = new Schema(
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
            default: '',
        },
        addedDate: {
            type: Date,
            default: Date.now,
        }
    }
);

export default wishlistBottleSchema;