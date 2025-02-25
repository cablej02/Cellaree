import {Schema} from 'mongoose';

const cellarBottleSchema = new Schema(
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
        purchasePrice: {
            type: Number,
            min: 0,
            default: 0,
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
        }
    }
);

export default cellarBottleSchema;