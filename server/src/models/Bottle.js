import { Schema, model } from 'mongoose';

const bottleSchema = new Schema(
    {
        winery: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        productName: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100,
        },
        location: {
            type: String,
            trim: true,
        },
        style: {
            type: Schema.Types.ObjectId,
            ref: 'WineStyle',
            required: true,
        },
    },
    { timestamps: true }
);

const Bottle = model('Bottle', bottleSchema);

export default Bottle;
