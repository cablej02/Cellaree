import { Schema } from 'mongoose';

const drankBottleSchema = new Schema(
    {
        bottle: {
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
        drankDate: {
            type: Date,
            required: true,
            default: Date.now,
        }
    }
);

export default drankBottleSchema;