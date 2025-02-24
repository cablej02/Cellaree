import {Schema } from 'mongoose';

const wishlistBottleSchema = new Schema(
    {
        bottleId: {
            type: Schema.Types.ObjectId,
            ref: 'Bottle',
            required: true,
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