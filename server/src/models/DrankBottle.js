import { Schema, model } from 'mongoose';

const drankBottleSchema = new Schema(
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
            index: true,
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
        },
        drankDate: {
            type: Date,
            required: true,
            default: Date.now,
        }
    },
    { timestamps: true }
);

// compound index to increase query performance
drankBottleSchema.index({ userId: 1, bottleId: 1});

const DrankBottle = model('DrankBottle', drankBottleSchema);
export default DrankBottle;