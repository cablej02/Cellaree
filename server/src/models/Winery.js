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
        }
    },
    { timestamps: true }
);

const Winery = model('Winery', winerySchema);
export default Winery;