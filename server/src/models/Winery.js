import { Schema, model } from 'mongoose';

const winerySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        countries: {
            type: [String],
            required: true,
            enum: ['Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'France', 'Germany', 'Greece', 'Hungary', 'Italy', 'Lebanon', 'Mexico', 'New Zealand', 'Portugal', 'Romania', 'South Africa', 'Spain', 'Switzerland', 'United States', 'Uruguay', 'Other'],
        },
    },
    { timestamps: true }
);

const Winery = model('Winery', winerySchema);
export default Winery;