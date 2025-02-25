import { Schema, model } from 'mongoose';

const bottleSchema = new Schema(
    {
        winery: {
            type: Schema.Types.ObjectId,
            ref: 'Winery',
            required: true,
            index: true,
        },
        productName: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100,
            index: true,
        },
        location: {
            type: String,
            trim: true,
            index: true,
        },
        wineStyle: {
            type: Schema.Types.ObjectId,
            ref: 'WineStyle',
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

const Bottle = model('Bottle', bottleSchema);

export default Bottle;
