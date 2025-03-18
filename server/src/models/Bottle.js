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
            trim: true,
            maxlength: 100,
            index: true,
            default: "",
        },
        country: {
            type: String,
            required: true,
            enum: ['Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'France', 'Germany', 'Greece', 'Hungary', 'Italy', 'Lebanon', 'Mexico', 'New Zealand', 'Portugal', 'Romania', 'South Africa', 'Spain', 'Switzerland', 'United States', 'Uruguay', 'Other'],
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
